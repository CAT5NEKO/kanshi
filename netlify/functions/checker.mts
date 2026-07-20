import { getStore } from "@netlify/blobs"
import type { Config } from "@netlify/functions"

const STORE_NAME = "kanshi"
const KEY_STATE = "state"
const KEY_HEARTBEATS = "heartbeats"

interface MonitorConfig {
	name: string
	url: string
}

type MonitorStatus = "up" | "down" | "unknown"

interface MonitorState {
	name: string
	url: string
	status: MonitorStatus
	last_checked_at: string | null
	response_time_ms: number | null
	uptime_pct: number
	consecutive_failures: number
	notification_sent: boolean
	prev_status: MonitorStatus
}

interface HeartbeatEntry {
	status: MonitorStatus
	status_code: number | null
	response_time_ms: number | null
	error: string | null
	checked_at: string
}

interface AllState {
	monitors: Record<string, MonitorState>
	last_checked_at: string | null
}

interface AllHeartbeats {
	[name: string]: HeartbeatEntry[]
}

const PRIVATE_IP_PATTERNS = [
	/^127\./,
	/^10\./,
	/^192\.168\./,
	/^0\.0\.0\.0$/,
	/^172\.(1[6-9]|2\d|3[01])\./,
	/^localhost$/,
	/^\[::1\]$/,
	/^\[fc00:/,
	/^\[fd00:/,
	/^::ffff:127\./,
	/^::ffff:10\./,
	/^::ffff:192\.168\./,
	/^::ffff:172\.(1[6-9]|2\d|3[01])\./,
]

export default async () => {
	if (process.env.DEV_MODE) {
		return
	}

	const monitorsJson = process.env.MONITORS
	if (!monitorsJson) {
		return
	}

	let monitorConfigs: MonitorConfig[]
	try {
		monitorConfigs = parseMonitorConfigs(monitorsJson)
	} catch {
		console.error("Failed to parse MONITORS env")
		return
	}

	if (monitorConfigs.length === 0) {
		return
	}

	const timeoutMs = parseEnvInt(process.env.CHECK_TIMEOUT_MS, 10000)
	const notifyAfter = parseEnvInt(process.env.NOTIFY_AFTER_FAILURES, 5)
	const retention = parseEnvInt(process.env.HEARTBEAT_RETENTION, 100)
	const discordUrl = process.env.DISCORD_WEBHOOK_URL

	const store = getStore(STORE_NAME)
	const state = await readState(store)
	const heartbeats = await readHeartbeats(store)
	const now = new Date().toISOString()

	const activeNames = new Set(monitorConfigs.map((m) => m.name))
	for (const name of Object.keys(state.monitors)) {
		if (!activeNames.has(name)) {
			delete state.monitors[name]
			delete heartbeats[name]
		}
	}

	for (const config of monitorConfigs) {
		if (config.name.length === 0 || config.url.length === 0) {
			continue
		}

		let existing = state.monitors[config.name]

		if (!existing) {
			existing = createMonitorState(config.name, config.url)
			state.monitors[config.name] = existing
		} else {
			existing.url = config.url
		}

		const result = await checkUrl(config.url, timeoutMs)
		const prevStatus = existing.status

		existing.last_checked_at = now
		existing.response_time_ms = result.response_time_ms ?? null
		existing.prev_status = prevStatus

		if (result.up) {
			existing.status = "up"
			existing.consecutive_failures = 0

			if (discordUrl && prevStatus === "down" && existing.notification_sent) {
				await sendDiscord(discordUrl, `${config.name} is back UP\n${config.url}`)
			}

			existing.notification_sent = false
		} else {
			existing.status = "down"
			existing.consecutive_failures++

			if (
				discordUrl &&
				existing.consecutive_failures >= notifyAfter &&
				!existing.notification_sent
			) {
				const sent = await sendDiscord(
					discordUrl,
					`${config.name} is DOWN (${existing.consecutive_failures} failures)\n${config.url}`,
				)
				if (sent) {
					existing.notification_sent = true
				}
			}
		}

		const heartbeat: HeartbeatEntry = {
			status: existing.status,
			status_code: result.status_code ?? null,
			response_time_ms: result.response_time_ms ?? null,
			error: result.error ?? null,
			checked_at: now,
		}

		if (!heartbeats[config.name]) {
			heartbeats[config.name] = []
		}
		heartbeats[config.name].push(heartbeat)
		heartbeats[config.name] = heartbeats[config.name].slice(-retention)
		existing.uptime_pct = calculateUptime(heartbeats[config.name])
	}

	state.last_checked_at = now

	try {
		await store.setJSON(KEY_STATE, state)
		await store.setJSON(KEY_HEARTBEATS, heartbeats)
	} catch (err) {
		console.error("Failed to persist state", err)
	}
}

export const config: Config = {
	schedule: "* * * * *",
}

function parseMonitorConfigs(json: string): MonitorConfig[] {
	const raw = JSON.parse(json)
	if (!Array.isArray(raw)) {
		throw new Error("MONITORS must be a JSON array")
	}
	return raw.map((item): MonitorConfig => {
		if (typeof item.name !== "string" || typeof item.url !== "string") {
			throw new Error("Each monitor must have name and url strings")
		}
		return { name: item.name as string, url: item.url as string }
	})
}

function createMonitorState(name: string, url: string): MonitorState {
	return {
		name,
		url,
		status: "unknown",
		last_checked_at: null,
		response_time_ms: null,
		uptime_pct: 100,
		consecutive_failures: 0,
		notification_sent: false,
		prev_status: "unknown",
	}
}

async function readState(store: ReturnType<typeof getStore>): Promise<AllState> {
	const data = await store.get(KEY_STATE, { consistency: "strong", type: "json" })
	if (data && typeof data === "object" && data.monitors) {
		return data as AllState
	}
	return { monitors: {}, last_checked_at: null }
}

async function readHeartbeats(store: ReturnType<typeof getStore>): Promise<AllHeartbeats> {
	const data = await store.get(KEY_HEARTBEATS, { consistency: "strong", type: "json" })
	if (data && typeof data === "object") {
		return data as AllHeartbeats
	}
	return {}
}

async function checkUrl(
	url: string,
	timeoutMs: number,
): Promise<{
	up: boolean
	status_code?: number
	response_time_ms?: number
	error?: string
}> {
	let parsed: URL
	try {
		parsed = new URL(url)
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return { up: false, error: `Unsupported protocol: ${parsed.protocol}` }
		}
	} catch {
		return { up: false, error: "Invalid URL" }
	}

	if (isPrivateHost(parsed.hostname)) {
		return { up: false, error: "Private network not allowed" }
	}

	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), timeoutMs)

	try {
		const start = Date.now()
		const response = await fetch(url, {
			method: "HEAD",
			redirect: "manual",
			signal: controller.signal,
		})
		const responseTime = Date.now() - start

		clearTimeout(timeout)

		return {
			up: true,
			status_code: response.status,
			response_time_ms: responseTime,
		}
	} catch (err) {
		clearTimeout(timeout)
		const message = err instanceof Error ? err.message : String(err)
		const truncated = message.length > 200 ? message.slice(0, 200) : message
		return { up: false, error: truncated }
	}
}

function isPrivateHost(hostname: string): boolean {
	return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname))
}

function parseEnvInt(value: string | undefined, fallback: number): number {
	if (value === undefined) return fallback
	const parsed = parseInt(value, 10)
	if (isNaN(parsed) || parsed <= 0) return fallback
	return parsed
}

function calculateUptime(heartbeats: HeartbeatEntry[]): number {
	if (heartbeats.length === 0) {
		return 100
	}
	const upCount = heartbeats.filter((h) => h.status === "up").length
	return Math.round((upCount / heartbeats.length) * 100 * 100) / 100
}

async function sendDiscord(webhookUrl: string, content: string): Promise<boolean> {
	try {
		const res = await fetch(webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		})
		return res.ok
	} catch {
		return false
	}
}
