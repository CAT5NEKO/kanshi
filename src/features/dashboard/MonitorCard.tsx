import { Link } from "@tanstack/react-router"
import type { MonitorState } from "@/shared/api"
import { StatusBadge } from "./StatusBadge"
import { UptimeBar } from "./UptimeBar"

export function MonitorCard({ monitor }: { monitor: MonitorState }) {
	const lastChecked = monitor.last_checked_at ? formatTimeAgo(monitor.last_checked_at) : "Never"

	return (
		<Link
			to="/monitors/$name"
			params={{ name: monitor.name }}
			style={{
				display: "block",
				textDecoration: "none",
				color: "inherit",
				padding: "clamp(12px, 3vw, 16px)",
				borderRadius: "8px",
				border: "1px solid #e5e7eb",
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
				className="card-row"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: "8px",
				}}
			>
				<span
					style={{
						fontWeight: 600,
						fontSize: "clamp(14px, 3vw, 16px)",
						wordBreak: "break-word",
						flex: 1,
					}}
				>
					{monitor.name}
				</span>
				<StatusBadge status={monitor.status} />
			</div>

			<div
				style={{
					fontSize: "13px",
					color: "#6b7280",
					marginBottom: "10px",
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{monitor.url}
			</div>

			<div
				className="uptime-row"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "12px",
				}}
			>
				<div style={{ flex: 1, minWidth: 0 }}>
					<UptimeBar pct={monitor.uptime_pct} />
				</div>
				<span style={{ fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap" }}>
					{lastChecked}
				</span>
			</div>
		</Link>
	)
}

function formatTimeAgo(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime()
	const seconds = Math.floor(diff / 1000)
	if (seconds < 60) return `${seconds}s ago`
	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	return `${days}d ago`
}
