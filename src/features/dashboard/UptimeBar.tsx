export function UptimeBar({ pct }: { pct: number }) {
	const clamped = Math.max(0, Math.min(100, pct))
	const color = clamped >= 99 ? "#22c55e" : clamped >= 95 ? "#f59e0b" : "#ef4444"

	return (
		<div style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%" }}>
			<div
				style={{
					flex: 1,
					height: "5px",
					borderRadius: "3px",
					background: "#e5e7eb",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						height: "100%",
						width: `${clamped}%`,
						background: color,
						borderRadius: "3px",
						transition: "width 0.3s ease",
					}}
				/>
			</div>
			<span
				style={{
					fontSize: "clamp(10px, 2vw, 13px)",
					fontWeight: 600,
					color,
					minWidth: "44px",
					textAlign: "right",
					fontVariantNumeric: "tabular-nums",
				}}
			>
				{clamped.toFixed(1)}%
			</span>
		</div>
	)
}
