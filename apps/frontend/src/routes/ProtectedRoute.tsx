import { useAuthStore } from "@/features/auth/useAuthStore"
import type { Role } from "@/types/auth.types"
import { Navigate, Outlet } from "react-router-dom"

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuthStore()
  const isAuthenticated = Boolean(token)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
