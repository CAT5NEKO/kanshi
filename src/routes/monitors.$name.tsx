import { createFileRoute, Link } from "@tanstack/react-router"
import { fetchDetail } from "@/shared/api"
import { StatusBadge } from "@/features/dashboard/StatusBadge"
import { UptimeStats } from "@/features/monitor-detail/UptimeStats"
import { HeartbeatTimeline } from "@/features/monitor-detail/HeartbeatTimeline"
import { usePolling } from "@/shared/hooks"

export const Route = createFileRoute("/monitors/$name")({
	loader: async ({ params }) => {
		const result = await fetchDetail(params.name)
		return result
	},
	staleTime: 30_000,
	component: MonitorDetailPage,
	pendingComponent: () => (
		<div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
			Loading...
		</div>
	),
	errorComponent: ({ error, reset }) => (
		<div style={{ textAlign: "center", padding: "60px 20px", color: "#dc2626" }}>
			<p style={{ fontSize: "18px", margin: 0 }}>{error.message}</p>
			<button
				onClick={reset}
				style={{
					marginTop: "16px",
					padding: "8px 20px",
					border: "none",
					borderRadius: 6,
					background: "#2563eb",
					color: "white",
					cursor: "pointer",
					fontSize: "14px",
				}}
			>
				Retry
			</button>
		</div>
	),
})

function MonitorDetailPage() {
	const { monitor, heartbeats } = Route.useLoaderData()
	usePolling(60_000)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
			<div>
				<Link
					to="/"
					style={{
						color: "#2563eb",
						textDecoration: "none",
						fontSize: "14px",
					}}
				>
					&larr; Back
				</Link>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					flexWrap: "wrap",
				}}
			>
				<h2
					style={{
						fontSize: "clamp(18px, 4vw, 24px)",
						fontWeight: 600,
						margin: 0,
						wordBreak: "break-word",
					}}
				>
					{monitor.name}
				</h2>
				<StatusBadge status={monitor.status} />
			</div>

			<a
				href={monitor.url}
				target="_blank"
				rel="noopener noreferrer"
				style={{ fontSize: "14px", color: "#6b7280", wordBreak: "break-all" }}
			>
				{monitor.url}
			</a>

			<UptimeStats
				uptimePct={monitor.uptime_pct}
				lastCheckedAt={monitor.last_checked_at}
				responseTimeMs={monitor.response_time_ms}
			/>

			{heartbeats.length > 0 && <HeartbeatTimeline heartbeats={heartbeats} />}
		</div>
	)
}
