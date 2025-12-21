import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCanvases, createCanvas, updateCanvasMeta, renameCanvas, deleteCanvas} from "./storage/storage"
import { CanvasMeta } from "./types/canvas"

export default function Dashboard() {
    const navigate = useNavigate()

    // // STEP 1: mock canvases so the UI works before backend
    // const initialCanvases = useMemo<CanvasMeta[]>(
    //     () => [
    //         { id: "c1", title: "System Design", updatedAt: new Date().toISOString() },
    //         { id: "c2", title: "Brainstorm", updatedAt: new Date().toISOString() },
    //         { id: "c3", title: "Flowchart Ideas", updatedAt: new Date().toISOString() },
    //     ],
    //     []
    // )

    const [canvases, setCanvases] = useState<CanvasMeta[]>(() => getCanvases())

    useEffect(() => {
        setCanvases(getCanvases())
    }, [])

    const onOpenCanvas = (id: string) => {
        updateCanvasMeta(id, {})
        setCanvases(getCanvases())
        // Later this will go to /app/:canvasId once we wire app routing
        navigate(`/app/${id}`)
    }

    const onNewCanvas = () => {
        const canvas = createCanvas()
        setCanvases(getCanvases())
        navigate(`/app/${canvas.id}`)
    }

    return (
        <div style={styles.page}>
            <header style={styles.topbar}>
                <div style={styles.logo}>🧠 VoiceBoard</div>
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
                            {/* <div style={styles.thumb} /> */}
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
                            {/* <div style={styles.cardTitle}>{c.title}</div> */}
                            <input
                                value={c.title}
                                onChange={(e) => {
                                    renameCanvas(c.id, e.target.value)
                                    setCanvases(getCanvases())
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
                                onClick={(e) => {
                                    e.stopPropagation()
                                    const ok = confirm(`Delete "${c.title}"?`)
                                    if (!ok) return
                                    deleteCanvas(c.id)
                                    setCanvases(getCanvases())
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
    logo: {
        fontWeight: 700,
        letterSpacing: 0.2,
    },
    main: {
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
        padding: "24px 20px",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 16,
    },
    h2: {
        margin: 0,
        fontSize: 20,
    },
    primaryBtn: {
        border: "1px solid #111",
        background: "#111",
        color: "#fff",
        padding: "10px 12px",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 14,
    },
    card: {
        textAlign: "left",
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 12,
        background: "#fff",
        cursor: "pointer",
    },
    thumb: {
        height: 120,
        borderRadius: 10,
        background: "#f5f5f5",
        marginBottom: 10,
    },
    cardTitle: {
        fontWeight: 700,
        marginBottom: 4,
    },
    cardSub: {
        fontSize: 12,
        color: "#555",
    },
}
