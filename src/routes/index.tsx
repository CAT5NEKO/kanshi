import { createFileRoute } from "@tanstack/react-router"
import { fetchStatus } from "@/shared/api"
import { MonitorCard } from "@/features/dashboard/MonitorCard"
import { usePolling } from "@/shared/hooks"

export const Route = createFileRoute("/")({
	loader: async () => {
		const result = await fetchStatus()
		return result
	},
	staleTime: 30_000,
	component: DashboardPage,
	pendingComponent: LoadingSkeleton,
	errorComponent: ErrorDisplay,
})

function DashboardPage() {
	const data = Route.useLoaderData()
	usePolling(60_000)

	const monitors = Object.values(data.monitors)

	if (monitors.length === 0) {
		return <EmptyState />
	}

	const sorted = [...monitors].sort((a, b) => a.name.localeCompare(b.name))

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
			<h2 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 600, margin: 0 }}>
				Monitors
			</h2>
			{sorted.map((m) => (
				<MonitorCard key={m.name} monitor={m} />
			))}
		</div>
	)
}

function LoadingSkeleton() {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
			<div
				style={{
					height: "28px",
					width: "120px",
					background: "#e5e7eb",
					borderRadius: 4,
				}}
			/>
			{[1, 2, 3].map((i) => (
				<div key={i} style={{ height: "80px", background: "#f3f4f6", borderRadius: 8 }} />
			))}
		</div>
	)
}

function EmptyState() {
	return (
		<div
			style={{
				textAlign: "center",
				padding: "clamp(32px, 8vw, 60px) 20px",
				color: "#6b7280",
			}}
		>
			<p style={{ fontSize: "clamp(16px, 3vw, 18px)", margin: 0 }}>No monitors configured.</p>
			<p style={{ fontSize: "14px", marginTop: "8px" }}>
				Add monitor URLs to the MONITORS environment variable.
			</p>
		</div>
	)
}

function ErrorDisplay({ error, reset }: { error: Error; reset: () => void }) {
	return (
		<div
			style={{
				textAlign: "center",
				padding: "clamp(32px, 8vw, 60px) 20px",
				color: "#dc2626",
			}}
		>
			<p style={{ fontSize: "clamp(16px, 3vw, 18px)", margin: 0 }}>Failed to load monitors</p>
			<p style={{ fontSize: "14px", marginTop: "8px", color: "#6b7280" }}>{error.message}</p>
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
	)
}
