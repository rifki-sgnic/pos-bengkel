import { useAuthStore } from "@/features/auth/useAuthStore"
import { Navigate, Outlet } from "react-router-dom"

export function PublicRoute() {
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = Boolean(token)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
