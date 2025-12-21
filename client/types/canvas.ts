export type CanvasMeta = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  thumbnail?: string // base64 image
}

export type CanvasDocument = {
  canvasId: string
  document: any
  updatedAt: string
  version: number
}
