import { CanvasDocument, CanvasMeta } from "../types/canvas"
import { supabase } from "../lib/supabaseClient"

/* =========================
   Helpers
   ========================= */

function nowIso() {
  return new Date().toISOString()
}

function mapCanvasRow(row: any): CanvasMeta {
  return {
    id: row.id,
    title: row.title ?? "Untitled Canvas",
    thumbnail: row.thumbnail ?? undefined,
    createdAt: row.created_at ?? nowIso(),
    updatedAt: row.updated_at ?? nowIso(),
  }
}

/* =========================
   Canvas meta functions
   ========================= */

export async function getCanvases(ownerId: string): Promise<CanvasMeta[]> {
  const { data, error } = await supabase
    .from("canvases")
    .select("id,title,thumbnail,created_at,updated_at")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("getCanvases error:", error)
    return []
  }

  return (data ?? []).map(mapCanvasRow)
}

export async function createCanvas(
  ownerId: string,
  title = "Untitled Canvas"
): Promise<CanvasMeta> {
  const { data, error } = await supabase
    .from("canvases")
    .insert({
      owner_id: ownerId,
      title,
      created_at: nowIso(),
      updated_at: nowIso(),
    })
    .select("id,title,thumbnail,created_at,updated_at")
    .single()

  if (error || !data) {
    console.error("createCanvas error:", error)
    // fallback shape so app doesn’t crash
    return {
      id: crypto.randomUUID(),
      title,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
  }

  return mapCanvasRow(data)
}

export async function updateCanvasMeta(
  ownerId: string,
  id: string,
  patch: Partial<CanvasMeta>
): Promise<void> {
  const payload: any = {
    updated_at: nowIso(),
  }

  if (typeof patch.title === "string") payload.title = patch.title
  if (typeof patch.thumbnail === "string") payload.thumbnail = patch.thumbnail

  const { error } = await supabase
    .from("canvases")
    .update(payload)
    .eq("id", id)
    .eq("owner_id", ownerId)

  if (error) console.error("updateCanvasMeta error:", error)
}

export async function renameCanvas(ownerId: string, id: string, title: string) {
  await updateCanvasMeta(ownerId, id, { title })
}

export async function updateCanvasThumbnail(ownerId: string, id: string, thumbnail: string) {
  await updateCanvasMeta(ownerId, id, { thumbnail })
}

export async function deleteCanvas(ownerId: string, id: string): Promise<void> {
  // documents table will cascade delete because of FK
  const { error } = await supabase.from("canvases").delete().eq("id", id).eq("owner_id", ownerId)
  if (error) console.error("deleteCanvas error:", error)
}

/* =========================
   Canvas document functions
   ========================= */

export async function saveCanvasDocument(ownerId: string, doc: CanvasDocument): Promise<void> {
  const { error } = await supabase.from("canvas_documents").upsert(
    {
      canvas_id: doc.canvasId,
      owner_id: ownerId,
      document: doc.document,
      version: doc.version ?? 1,
      updated_at: doc.updatedAt ?? nowIso(),
    },
    { onConflict: "canvas_id" }
  )

  if (error) console.error("saveCanvasDocument error:", error)
}

export async function loadCanvasDocument(
  ownerId: string,
  canvasId: string
): Promise<CanvasDocument | null> {
  const { data, error } = await supabase
    .from("canvas_documents")
    .select("canvas_id,document,version,updated_at")
    .eq("canvas_id", canvasId)
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    console.error("loadCanvasDocument error:", error)
    return null
  }

  if (!data) return null

  return {
    canvasId: data.canvas_id,
    document: data.document,
    version: data.version ?? 1,
    updatedAt: data.updated_at ?? nowIso(),
  }
}
