import { useNavigate } from "react-router-dom"

export function BackToDashboardButton() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: "6px 10px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        ← Dashboard
      </button>
    </div>
  )
}
