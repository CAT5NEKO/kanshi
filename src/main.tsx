import "./index.css"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

const rootElement = document.getElementById("root")
if (!rootElement) {
	throw new Error("Root element not found")
}

const root = ReactDOM.createRoot(rootElement)
root.render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
)
