import { useEffect, useMemo, useState } from "react"
import {
  DefaultSizeStyle,
  ErrorBoundary,
  TLComponents,
  Tldraw,
  TldrawUiToastsProvider,
  TLUiOverrides,
  useEditor,
} from "tldraw"
import { useNavigate, useParams } from "react-router-dom"

import { TldrawAgent } from "./agent/TldrawAgent"
import { useTldrawAgent } from "./agent/useTldrawAgent"
import { ChatPanel } from "./components/ChatPanel"
import { ChatPanelFallback } from "./components/ChatPanelFallback"
import { CustomHelperButtons } from "./components/CustomHelperButtons"
import { AgentViewportBoundsHighlight } from "./components/highlights/AgentViewportBoundsHighlights"
import { ContextHighlights } from "./components/highlights/ContextHighlights"
import { TargetAreaTool } from "./tools/TargetAreaTool"
import { TargetShapeTool } from "./tools/TargetShapeTool"
import { BackToDashboardButton } from "./components/DashButton"

import {
  loadCanvasDocument,
  saveCanvasDocument,
  updateCanvasThumbnail,
} from "./storage/storage"

import { supabase } from "./lib/supabaseClient"

export const AGENT_ID = "agent-starter"

DefaultSizeStyle.setDefaultValue("s")

const tools = [TargetAreaTool, TargetShapeTool]
const overrides: TLUiOverrides = {
  tools: (editor, tools) => ({
    ...tools,
    "target-area": {
      id: "target-area",
      label: "Pick Area",
      kbd: "c",
      icon: "tool-frame",
      onSelect() {
        editor.setCurrentTool("target-area")
      },
    },
    "target-shape": {
      id: "target-shape",
      label: "Pick Shape",
      kbd: "s",
      icon: "tool-frame",
      onSelect() {
        editor.setCurrentTool("target-shape")
      },
    },
  }),
}

function App() {
  const [agent, setAgent] = useState<TldrawAgent | undefined>()

  const components: TLComponents = useMemo(() => {
    return {
      HelperButtons: () => agent && <CustomHelperButtons agent={agent} />,
      InFrontOfTheCanvas: () => (
        <>
          <BackToDashboardButton />
          {agent && <AgentViewportBoundsHighlight agent={agent} />}
          {agent && <ContextHighlights agent={agent} />}
        </>
      ),
    }
  }, [agent])

  return (
    <TldrawUiToastsProvider>
      <div className="tldraw-agent-container">
        <div className="tldraw-canvas">
          <Tldraw tools={tools} overrides={overrides} components={components}>
            <AppInner setAgent={setAgent} />
          </Tldraw>
        </div>
      </div>
    </TldrawUiToastsProvider>
  )
}

function AppInner({ setAgent }: { setAgent: (agent: TldrawAgent) => void }) {
  const [canvasMissing, setCanvasMissing] = useState(false)
  const editor = useEditor()
  const agent = useTldrawAgent(editor, AGENT_ID)
  const { canvasId } = useParams()
  const navigate = useNavigate()

  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // 🔥 Saving indicator state
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // --- Auth gate ---
  useEffect(() => {
    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getSession()
      const uid = data.session?.user?.id ?? null
      if (!mounted) return

      setOwnerId(uid)
      setAuthLoading(false)

      if (!uid) navigate("/signin", { replace: true })
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      setOwnerId(uid)
      setAuthLoading(false)
      if (!uid) navigate("/signin", { replace: true })
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  // Load canvas
  useEffect(() => {
  if (!editor || !canvasId || !ownerId) return

  let cancelled = false

  ;(async () => {
    const saved = await loadCanvasDocument(ownerId, canvasId)

    if (cancelled) return

    if (!saved) {
      setCanvasMissing(true)
      return
    }

    editor.loadSnapshot(saved.document)
  })()

  return () => {
    cancelled = true
  }
}, [editor, canvasId, ownerId])


  // 💾 Save canvas with indicator
  useEffect(() => {
  if (!editor || !canvasId || !ownerId) return

  let timeout: number | undefined

  const unsubscribe = editor.store.listen(() => {
    setIsSaving(true)

    window.clearTimeout(timeout)
    timeout = window.setTimeout(async () => {
      await saveCanvasDocument(ownerId, {
        canvasId,
        document: editor.getSnapshot(),
        updatedAt: new Date().toISOString(),
        version: 1,
      })

      setIsSaving(false)
      setLastSavedAt(new Date())
    }, 500)
  })

  return () => {
    unsubscribe()
    window.clearTimeout(timeout)
  }
}, [editor, canvasId, ownerId])


  // Thumbnail generation
  useEffect(() => {
    if (!editor || !canvasId || !ownerId) return

    let timeout: number | undefined

    const unsubscribe = editor.store.listen(() => {
      window.clearTimeout(timeout)

      timeout = window.setTimeout(async () => {
        const shapes = editor.getCurrentPageShapes()
        if (!shapes.length) return

        const result = await editor.getSvgString(shapes)
        if (!result) return

        const { svg, width, height } = result
        const svgBlob = new Blob([svg], { type: "image/svg+xml" })
        const url = URL.createObjectURL(svgBlob)
        const img = new Image()

        img.onload = () => {
          const canvas = document.createElement("canvas")
          const targetWidth = 300
          const scale = targetWidth / width

          canvas.width = targetWidth
          canvas.height = height * scale

          const ctx = canvas.getContext("2d")
          if (!ctx) return

          ctx.fillStyle = "#fff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          updateCanvasThumbnail(ownerId, canvasId, canvas.toDataURL("image/png"))
          URL.revokeObjectURL(url)
        }

        img.src = url
      }, 800)
    })

    return () => {
      unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [editor, canvasId, ownerId])

  // Agent setup
  useEffect(() => {
    if (!editor || !agent) return
    setAgent(agent)
    ;(window as any).editor = editor
    ;(window as any).agent = agent
  }, [agent, editor, setAgent])

  if (authLoading || !ownerId) return null

  // 🔥 Saving indicator UI
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 180,
        fontSize: 12,
        opacity: 0.7,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <span style={{ color: isSaving ? "#999" : "#16a34a" }}>
        {isSaving ? "● Saving…" : lastSavedAt ? "✓ Saved" : ""}
      </span>
    </div>
  )
}

export default App
