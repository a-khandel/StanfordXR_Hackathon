import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "./lib/supabaseClient"
import { useAuth } from "./auth"

export default function SignIn() {
  const { session } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from || "/dashboard"

  useEffect(() => {
    if (session) nav(from, { replace: true })
  }, [session, nav, from])

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 420, border: "1px solid #eee", borderRadius: 16, padding: 18 }}>
        <h2 style={{ margin: 0 }}>Sign in</h2>
        <p style={{ opacity: 0.7 }}>Use email + password to log in.</p>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
      </div>
    </main>
  )
}
