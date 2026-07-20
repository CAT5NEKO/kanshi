import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { HeartbeatEntry } from "@/shared/api"

export function HeartbeatTimeline({ heartbeats }: { heartbeats: HeartbeatEntry[] }) {
	const data = heartbeats
		.filter(
			(h): h is HeartbeatEntry & { response_time_ms: number } => h.response_time_ms != null,
		)
		.map((h) => ({
			time: new Date(h.checked_at).toLocaleTimeString(),
			ms: h.response_time_ms,
			status: h.status as "up" | "down",
		}))
		.slice(-50)

	if (data.length === 0) {
		return (
			<div style={{ padding: "20px 0", color: "#6b7280", fontSize: "14px" }}>
				No response time data available yet.
			</div>
		)
	}

	return (
		<div>
			<h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
				Response Time (last {data.length})
			</h3>
			<ResponsiveContainer width="100%" height={200}>
				<BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
					<XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
					<YAxis tick={{ fontSize: 10 }} unit="ms" width={50} />
					<Tooltip
						formatter={(value: number) => [`${value}ms`, "Response Time"]}
						labelFormatter={(label: string) => `Time: ${label}`}
					/>
					<Bar dataKey="ms" radius={[2, 2, 0, 0]}>
						{data.map((entry, i) => (
							<Cell key={i} fill={entry.status === "up" ? "#22c55e" : "#ef4444"} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}
