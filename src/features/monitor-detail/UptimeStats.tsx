export function UptimeStats({
	uptimePct,
	lastCheckedAt,
	responseTimeMs,
}: {
	uptimePct: number
	lastCheckedAt: string | null
	responseTimeMs: number | null
}) {
	return (
		<div
			className="stats-grid"
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
				gap: "12px",
			}}
		>
			<StatBox label="Uptime" value={`${uptimePct.toFixed(2)}%`} />
			<StatBox
				label="Response Time"
				value={responseTimeMs != null ? `${responseTimeMs}ms` : "N/A"}
			/>
			<StatBox
				label="Last Checked"
				value={lastCheckedAt ? formatDate(lastCheckedAt) : "Never"}
			/>
		</div>
	)
}

function StatBox({ label, value }: { label: string; value: string }) {
	return (
		<div
			style={{
				padding: "clamp(12px, 3vw, 16px)",
				borderRadius: "8px",
				border: "1px solid #e5e7eb",
				background: "#f9fafb",
			}}
		>
			<div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>{label}</div>
			<div
				style={{
					fontSize: "clamp(16px, 3vw, 20px)",
					fontWeight: 700,
					wordBreak: "break-all",
				}}
			>
				{value}
			</div>
		</div>
	)
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleString()
}
