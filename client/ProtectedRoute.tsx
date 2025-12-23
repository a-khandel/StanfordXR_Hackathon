import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./auth"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // You can swap this for a nicer spinner later
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>

  if (!user) {
    // bounce to signin, remember where they were going
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

