export type MonitorStatus = "up" | "down" | "unknown"

export interface MonitorState {
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

export interface HeartbeatEntry {
	status: MonitorStatus
	status_code: number | null
	response_time_ms: number | null
	error: string | null
	checked_at: string
}

export interface AllState {
	monitors: Record<string, MonitorState>
	last_checked_at: string | null
}

export interface AllHeartbeats {
	[name: string]: HeartbeatEntry[]
}

export interface ApiStatusResponse {
	monitors: Record<string, MonitorState>
	last_checked_at: string | null
}

export interface ApiDetailResponse {
	monitor: MonitorState
	heartbeats: HeartbeatEntry[]
}

export async function fetchStatus(): Promise<ApiStatusResponse> {
	const res = await fetch("/api/status")
	if (!res.ok) {
		throw new Error(`Status fetch failed: ${res.status}`)
	}
	return res.json()
}

export async function fetchDetail(name: string): Promise<ApiDetailResponse> {
	const res = await fetch(`/api/status/${encodeURIComponent(name)}`)
	if (!res.ok) {
		throw new Error(`Detail fetch failed: ${res.status}`)
	}
	return res.json()
}
