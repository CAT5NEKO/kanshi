import { Link } from "@tanstack/react-router"
import type { MonitorState } from "@/shared/api"
import { StatusBadge } from "./StatusBadge"
import { UptimeBar } from "./UptimeBar"

const STATUS_BORDER: Record<string, string> = {
	up: "#22c55e",
	down: "#ef4444",
	unknown: "#d1d5db",
}

export function MonitorCard({ monitor }: { monitor: MonitorState }) {
	const lastChecked = monitor.last_checked_at ? formatTimeAgo(monitor.last_checked_at) : "Never"
	const responseTime =
		monitor.response_time_ms != null ? `${monitor.response_time_ms}ms` : null
	const borderColor = STATUS_BORDER[monitor.status]

	return (
		<Link
			to="/monitors/$name"
			params={{ name: monitor.name }}
			style={{
				display: "block",
				textDecoration: "none",
				color: "inherit",
				padding: "clamp(10px, 2.5vw, 16px) clamp(10px, 2.5vw, 16px)",
				borderRadius: "8px",
				border: "1px solid #e5e7eb",
				borderLeft: `3px solid ${borderColor}`,
				background: "#ffffff",
				transition: "box-shadow 0.15s ease",
			}}
			onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
				e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"
			}}
			onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
				e.currentTarget.style.boxShadow = ""
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "8px",
					marginBottom: "6px",
				}}
			>
				<span
					style={{
						fontWeight: 600,
						fontSize: "clamp(13px, 2.8vw, 16px)",
						wordBreak: "break-word",
						flex: 1,
						minWidth: 0,
					}}
				>
					{monitor.name}
				</span>
				<StatusBadge status={monitor.status} />
			</div>

			<div
				style={{
					fontSize: "12px",
					color: "#6b7280",
					marginBottom: "8px",
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{monitor.url}
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "10px",
				}}
			>
				<div style={{ flex: 1, minWidth: 0 }}>
					<UptimeBar pct={monitor.uptime_pct} />
				</div>
				{responseTime && (
					<span
						style={{
							fontSize: "11px",
							color: "#6b7280",
							whiteSpace: "nowrap",
							fontVariantNumeric: "tabular-nums",
						}}
					>
						{responseTime}
					</span>
				)}
				<span
					style={{
						fontSize: "11px",
						color: "#9ca3af",
						whiteSpace: "nowrap",
					}}
				>
					{lastChecked}
				</span>
			</div>
		</Link>
	)
}

function formatTimeAgo(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime()
	const seconds = Math.floor(diff / 1000)
	if (seconds < 60) return `${seconds}s`
	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `${minutes}m`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h`
	const days = Math.floor(hours / 24)
	return `${days}d`
}
