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
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
				gap: "10px",
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
				padding: "clamp(10px, 2.5vw, 16px)",
				borderRadius: "8px",
				border: "1px solid #e5e7eb",
				background: "#f9fafb",
			}}
		>
			<div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>{label}</div>
			<div
				style={{
					fontSize: "clamp(15px, 3vw, 20px)",
					fontWeight: 700,
					wordBreak: "break-all",
					fontVariantNumeric: "tabular-nums",
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
