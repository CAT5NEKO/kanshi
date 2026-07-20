import { useEffect } from "react"
import { useRouter } from "@tanstack/react-router"

export function usePolling(ms: number) {
	const router = useRouter()

	useEffect(() => {
		const id = setInterval(() => {
			router.invalidate()
		}, ms)
		return () => clearInterval(id)
	}, [ms, router])
}
