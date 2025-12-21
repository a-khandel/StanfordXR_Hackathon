import { CanvasMeta, CanvasDocument } from "../types/canvas"

const CANVAS_INDEX_KEY = "canvases:index"

function readIndex(): CanvasMeta[] {
  const raw = localStorage.getItem(CANVAS_INDEX_KEY)
  return raw ? JSON.parse(raw) : []
}

function writeIndex(canvases: CanvasMeta[]) {
  localStorage.setItem(CANVAS_INDEX_KEY, JSON.stringify(canvases))
}

/* =========================
   Dashboard-level functions
   ========================= */

export function getCanvases(): CanvasMeta[] {
  return readIndex().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function createCanvas(title = "Untitled Canvas"): CanvasMeta {
  const canvas: CanvasMeta = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const canvases = readIndex()
  writeIndex([canvas, ...canvases])

  return canvas
}

export function updateCanvasMeta(id: string, updates: Partial<CanvasMeta>) {
  const canvases = readIndex().map((c) =>
    c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
  )
  writeIndex(canvases)
}

/* =========================
   Canvas document functions
   ========================= */

export function saveCanvasDocument(doc: CanvasDocument) {
  localStorage.setItem(
    `canvas:doc:${doc.canvasId}`,
    JSON.stringify(doc)
  )
}

export function loadCanvasDocument(canvasId: string): CanvasDocument | null {
  const raw = localStorage.getItem(`canvas:doc:${canvasId}`)
  return raw ? JSON.parse(raw) : null
}

export function deleteCanvas(id: string) {
  const canvases = readIndex().filter((c) => c.id !== id)
  writeIndex(canvases)

  localStorage.removeItem(`canvas:doc:${id}`)
}

export function renameCanvas(id: string, title: string) {
  updateCanvasMeta(id, { title })
}

export function updateCanvasThumbnail(id: string, thumbnail: string) {
  const canvases = readIndex().map((c) =>
    c.id === id
      ? { ...c, thumbnail, updatedAt: new Date().toISOString() }
      : c
  )
  writeIndex(canvases)
}