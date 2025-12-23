import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getCanvases,
  createCanvas,
  updateCanvasMeta,
  renameCanvas,
  deleteCanvas,
} from "./storage/storage"
import { CanvasMeta } from "./types/canvas"
import { supabase } from "./lib/supabaseClient"

export default function Dashboard() {
  const navigate = useNavigate()

  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [canvases, setCanvases] = useState<CanvasMeta[]>([])

  useEffect(() => {
    let mounted = true

    async function refresh(uid: string) {
      const list = await getCanvases(uid)
      if (mounted) setCanvases(list)
    }

    async function init() {
      const { data } = await supabase.auth.getSession()
      const uid = data.session?.user?.id ?? null
      if (!mounted) return

      setOwnerId(uid)
      setAuthLoading(false)

      if (!uid) {
        navigate("/signin", { replace: true })
        return
      }

      await refresh(uid)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id ?? null
      setOwnerId(uid)
      setAuthLoading(false)

      if (!uid) {
        setCanvases([])
        navigate("/signin", { replace: true })
      } else {
        await refresh(uid)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  if (authLoading) return <div style={{ padding: 20 }}>Loading…</div>
  if (!ownerId) return null

  const refresh = async () => setCanvases(await getCanvases(ownerId))

  const onOpenCanvas = async (canvasId: string) => {
    await updateCanvasMeta(ownerId, canvasId, {})
    await refresh()
    navigate(`/app/${canvasId}`)
  }

  const onNewCanvas = async () => {
    const canvas = await createCanvas(ownerId)
    await refresh()
    navigate(`/app/${canvas.id}`)
  }

  return (
    <div style={styles.page}>
      <header style={styles.topbar}>
        <div style={styles.logo}>🧠 VoiceBoard</div>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            navigate("/signin", { replace: true })
          }}
          style={{
            marginLeft: "auto",
            border: "1px solid #eee",
            background: "transparent",
            padding: "8px 10px",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.headerRow}>
          <h2 style={styles.h2}>Your Canvases</h2>
          <button style={styles.primaryBtn} onClick={onNewCanvas}>
            + New Canvas
          </button>
        </div>

        <div style={styles.grid}>
          {canvases.map((c) => (
            <button
              key={c.id}
              style={styles.card}
              onClick={() => onOpenCanvas(c.id)}
              title="Open canvas"
            >
              <div style={styles.thumb}>
                {c.thumbnail && (
                  <img
                    src={c.thumbnail}
                    alt="Canvas preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 10,
                    }}
                  />
                )}
              </div>

              <input
                value={c.title}
                onChange={async (e) => {
                  await renameCanvas(ownerId, c.id, e.target.value)
                  await refresh()
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  border: "none",
                  fontWeight: 700,
                  width: "100%",
                  background: "transparent",
                  cursor: "text",
                }}
              />

              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  const ok = confirm(`Delete "${c.title}"?`)
                  if (!ok) return
                  await deleteCanvas(ownerId, c.id)
                  await refresh()
                }}
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  background: "transparent",
                  border: "none",
                  color: "#c00",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>

              <div style={styles.cardSub}>
                Last edited {new Date(c.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fff",
    color: "#111",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    height: 56,
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "1px solid #eee",
  },
  logo: { fontWeight: 700, letterSpacing: 0.2 },
  main: { maxWidth: 1100, width: "100%", margin: "0 auto", padding: "24px 20px" },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  h2: { margin: 0, fontSize: 20 },
  primaryBtn: {
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 },
  card: {
    textAlign: "left",
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 12,
    background: "#fff",
    cursor: "pointer",
  },
  thumb: { height: 120, borderRadius: 10, background: "#f5f5f5", marginBottom: 10 },
  cardSub: { fontSize: 12, color: "#555" },
}
