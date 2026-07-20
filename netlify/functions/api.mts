import { getStore } from "@netlify/blobs"
import type { Config, Context } from "@netlify/functions"

const STORE_NAME = "kanshi"
const KEY_STATE = "state"
const KEY_HEARTBEATS = "heartbeats"

interface AllState {
	monitors: Record<string, unknown>
	last_checked_at: string | null
}

interface AllHeartbeats {
	[name: string]: unknown[]
}

export default async (req: Request, context: Context) => {
	if (process.env.DEV_MODE) {
		return handleDevMode(req, context)
	}

	const store = getStore(STORE_NAME)
	const url = new URL(req.url)
	const name = context.params.name

	if (name) {
		return handleDetail(store, name)
	}

	if (url.pathname === "/api/status") {
		return handleAll(store)
	}

	return new Response(JSON.stringify({ error: "Not found" }), {
		status: 404,
		headers: { "Content-Type": "application/json" },
	})
}

export const config: Config = {
	path: ["/api/status", "/api/status/:name"],
}

async function handleAll(store: ReturnType<typeof getStore>): Promise<Response> {
	const state = await readState(store)

	return new Response(
		JSON.stringify({
			monitors: state.monitors,
			last_checked_at: state.last_checked_at,
		}),
		{
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=30",
			},
		},
	)
}

async function handleDetail(store: ReturnType<typeof getStore>, name: string): Promise<Response> {
	const decoded = decodeURIComponent(name)
	const state = await readState(store)
	const heartbeats = await readHeartbeats(store)

	const monitor = state.monitors[decoded]
	if (!monitor) {
		return new Response(JSON.stringify({ error: "Monitor not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		})
	}

	return new Response(
		JSON.stringify({
			monitor,
			heartbeats: heartbeats[decoded] ?? [],
		}),
		{
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=30",
			},
		},
	)
}

async function readState(store: ReturnType<typeof getStore>): Promise<AllState> {
	const data = await store.get(KEY_STATE, { type: "json" })
	if (data && typeof data === "object" && data.monitors) {
		return data as AllState
	}
	return { monitors: {}, last_checked_at: null }
}

async function readHeartbeats(store: ReturnType<typeof getStore>): Promise<AllHeartbeats> {
	const data = await store.get(KEY_HEARTBEATS, { type: "json" })
	if (data && typeof data === "object") {
		return data as AllHeartbeats
	}
	return {}
}

function handleDevMode(req: Request, context: Context): Response {
	const url = new URL(req.url)
	const name = context.params.name

	if (name) {
		return devDetail(name)
	}

	if (url.pathname === "/api/status") {
		return devAll()
	}

	return new Response(JSON.stringify({ error: "Not found" }), {
		status: 404,
		headers: { "Content-Type": "application/json" },
	})
}

function devAll(): Response {
	const now = new Date().toISOString()
	const monitors: Record<string, unknown> = {
		"Example Site": {
			name: "Example Site",
			url: "https://example.com",
			status: "up",
			last_checked_at: now,
			response_time_ms: 234,
			uptime_pct: 99.87,
			consecutive_failures: 0,
			notification_sent: false,
			prev_status: "up",
		},
		"Test API": {
			name: "Test API",
			url: "https://example.com/broken",
			status: "down",
			last_checked_at: now,
			response_time_ms: null,
			uptime_pct: 72.34,
			consecutive_failures: 3,
			notification_sent: false,
			prev_status: "down",
		},
		"Local Dev": {
			name: "Local Dev",
			url: "https://example.com/unchecked",
			status: "unknown",
			last_checked_at: null,
			response_time_ms: null,
			uptime_pct: 100,
			consecutive_failures: 0,
			notification_sent: false,
			prev_status: "unknown",
		},
	}

	return new Response(JSON.stringify({ monitors, last_checked_at: now }), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache",
		},
	})
}

function devDetail(name: string): Response {
	const decoded = decodeURIComponent(name)
	const now = new Date().toISOString()
	const monitors: Record<string, unknown> = {
		"Example Site": {
			name: "Example Site",
			url: "https://example.com",
			status: "up",
			last_checked_at: now,
			response_time_ms: 234,
			uptime_pct: 99.87,
			consecutive_failures: 0,
			notification_sent: false,
			prev_status: "up",
		},
		"Test API": {
			name: "Test API",
			url: "https://example.com/broken",
			status: "down",
			last_checked_at: now,
			response_time_ms: null,
			uptime_pct: 72.34,
			consecutive_failures: 3,
			notification_sent: false,
			prev_status: "down",
		},
		"Local Dev": {
			name: "Local Dev",
			url: "https://example.com/unchecked",
			status: "unknown",
			last_checked_at: null,
			response_time_ms: null,
			uptime_pct: 100,
			consecutive_failures: 0,
			notification_sent: false,
			prev_status: "unknown",
		},
	}

	const monitor = monitors[decoded]
	if (!monitor) {
		return new Response(JSON.stringify({ error: "Monitor not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		})
	}

	const heartbeats = generateMockHeartbeats(now)

	return new Response(JSON.stringify({ monitor, heartbeats }), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache",
		},
	})
}

function generateMockHeartbeats(now: string): unknown[] {
	const base = new Date(now).getTime()
	const entries: unknown[] = []
	for (let i = 49; i >= 0; i--) {
		const up = i > 2
		const responseTime = up ? 180 + Math.floor(Math.random() * 200) : null
		entries.push({
			status: up ? "up" : "down",
			status_code: up ? 200 : 503,
			response_time_ms: responseTime,
			error: up ? null : "Service Unavailable",
			checked_at: new Date(base - i * 60_000).toISOString(),
		})
	}
	return entries
}
