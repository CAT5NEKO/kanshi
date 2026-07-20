import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import type { Plugin } from "vite"
import path from "path"

function devModeApiPlugin(enabled: boolean): Plugin | null {
	if (!enabled) return null

	return {
		name: "dev-mode-api",
		configureServer(server) {
			server.middlewares.use("/api/status", (req, res) => {
				const qIndex = (req.url ?? "").indexOf("?")
				const rawPath = qIndex >= 0 ? (req.url ?? "").slice(0, qIndex) : (req.url ?? "")
				const pathParts = rawPath.replace("/api/status", "").replace(/^\//, "")
				const name = pathParts ? decodeURIComponent(pathParts) : null

				const now = new Date().toISOString()
				const monitors: Record<string, unknown> = {
					"Example Site": {
						name: "Example Site",
						url: "https://example.com",
						status: "up",
						last_checked_at: now,
						response_time_ms: 234,
						uptime_pct: 99.87,
						consecutive_failures: 0,
						notification_sent: false,
						prev_status: "up",
					},
					"Test API": {
						name: "Test API",
						url: "https://example.com/broken",
						status: "down",
						last_checked_at: now,
						response_time_ms: null,
						uptime_pct: 72.34,
						consecutive_failures: 3,
						notification_sent: false,
						prev_status: "down",
					},
					"Local Dev": {
						name: "Local Dev",
						url: "https://example.com/unchecked",
						status: "unknown",
						last_checked_at: null,
						response_time_ms: null,
						uptime_pct: 100,
						consecutive_failures: 0,
						notification_sent: false,
						prev_status: "unknown",
					},
				}

				res.setHeader("Content-Type", "application/json")
				res.setHeader("Cache-Control", "no-cache")

				if (name) {
					const monitor = monitors[name]
					if (!monitor) {
						res.statusCode = 404
						res.end(JSON.stringify({ error: "Monitor not found" }))
						return
					}
					const heartbeats = generateMockHeartbeats(now)
					res.end(JSON.stringify({ monitor, heartbeats }))
					return
				}

				res.end(JSON.stringify({ monitors, last_checked_at: now }))
			})
		},
	}
}

function generateMockHeartbeats(now: string): unknown[] {
	const base = new Date(now).getTime()
	const entries: unknown[] = []
	for (let i = 49; i >= 0; i--) {
		const up = i > 2
		const responseTime = up ? 180 + Math.floor(Math.random() * 200) : null
		entries.push({
			status: up ? "up" : "down",
			status_code: up ? 200 : 503,
			response_time_ms: responseTime,
			error: up ? null : "Service Unavailable",
			checked_at: new Date(base - i * 60_000).toISOString(),
		})
	}
	return entries
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")
	const isDevMode = env.DEV_MODE === "true"

	return {
		plugins: [TanStackRouterVite(), react(), devModeApiPlugin(isDevMode)].filter(
			Boolean,
		) as Plugin[],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	}
})
