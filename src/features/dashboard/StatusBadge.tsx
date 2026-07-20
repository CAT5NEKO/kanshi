import type { MonitorStatus } from "@/shared/api"

const STATUS_COLORS: Record<MonitorStatus, { bg: string; dot: string; text: string }> = {
	up: { bg: "#f0fdf4", dot: "#22c55e", text: "#166534" },
	down: { bg: "#fef2f2", dot: "#ef4444", text: "#991b1b" },
	unknown: { bg: "#f9fafb", dot: "#9ca3af", text: "#4b5563" },
}

const STATUS_LABELS: Record<MonitorStatus, string> = {
	up: "UP",
	down: "DOWN",
	unknown: "UNKNOWN",
}

export function StatusBadge({ status }: { status: MonitorStatus }) {
	const colors = STATUS_COLORS[status]

	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "6px",
				padding: "2px 10px",
				borderRadius: "9999px",
				fontSize: "12px",
				fontWeight: 600,
				background: colors.bg,
				color: colors.text,
			}}
		>
			<span
				style={{
					width: "8px",
					height: "8px",
					borderRadius: "50%",
					background: colors.dot,
					display: "inline-block",
				}}
			/>
			{STATUS_LABELS[status]}
		</span>
	)
}
