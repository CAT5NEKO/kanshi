import { createRootRoute, Link, Outlet } from "@tanstack/react-router"

export const Route = createRootRoute({
	component: RootLayout,
})

function RootLayout() {
	return (
		<>
			<header
				style={{
					padding: "12px 16px",
					display: "flex",
					alignItems: "center",
					gap: "16px",
					background: "#1e293b",
					color: "#f1f5f9",
				}}
				className="app-header"
			>
				<Link
					to="/"
					style={{
						fontSize: "20px",
						fontWeight: 700,
						textDecoration: "none",
						color: "inherit",
					}}
				>
					Kanshi
				</Link>
			</header>
			<main
				style={{
					maxWidth: "960px",
					margin: "0 auto",
					padding: "16px 12px",
				}}
				className="app-main"
			>
				<Outlet />
			</main>
		</>
	)
}
