import { useEffect, useMemo, useState } from 'react'
import {
	DefaultSizeStyle,
	ErrorBoundary,
	TLComponents,
	Tldraw,
	TldrawUiToastsProvider,
	TLUiOverrides,
	useEditor,
} from 'tldraw'
import { TldrawAgent } from './agent/TldrawAgent'
import { useTldrawAgent } from './agent/useTldrawAgent'
import { ChatPanel } from './components/ChatPanel'
import { ChatPanelFallback } from './components/ChatPanelFallback'
import { CustomHelperButtons } from './components/CustomHelperButtons'
import { AgentViewportBoundsHighlight } from './components/highlights/AgentViewportBoundsHighlights'
import { ContextHighlights } from './components/highlights/ContextHighlights'
import { TargetAreaTool } from './tools/TargetAreaTool'
import { TargetShapeTool } from './tools/TargetShapeTool'
import { BackToDashboardButton } from "./components/DashButton"
import { useParams } from "react-router-dom"
import { loadCanvasDocument, saveCanvasDocument, updateCanvasThumbnail} from "./storage/storage"

/**
 * The ID used for this project's agent.
 * If you want to support multiple agents, you can use a different ID for each agent.
 */
export const AGENT_ID = 'agent-starter'

// Customize tldraw's styles to play to the agent's strengths
DefaultSizeStyle.setDefaultValue('s')

// Custom tools for picking context items
const tools = [TargetShapeTool, TargetAreaTool]
const overrides: TLUiOverrides = {
	tools: (editor, tools) => {
		return {
			...tools,
			'target-area': {
				id: 'target-area',
				label: 'Pick Area',
				kbd: 'c',
				icon: 'tool-frame',
				onSelect() {
					editor.setCurrentTool('target-area')
				},
			},
			'target-shape': {
				id: 'target-shape',
				label: 'Pick Shape',
				kbd: 's',
				icon: 'tool-frame',
				onSelect() {
					editor.setCurrentTool('target-shape')
				},
			},
		}
	},
}

function App() {
	const [agent, setAgent] = useState<TldrawAgent | undefined>()

	// Custom components to visualize what the agent is doing
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
					<Tldraw
						// persistenceKey="tldraw-agent-demo"
						tools={tools}
						overrides={overrides}
						components={components}
					>
						<AppInner setAgent={setAgent} />
					</Tldraw>
				</div>
				<ErrorBoundary fallback={ChatPanelFallback}>
					{agent && <ChatPanel agent={agent} />}
				</ErrorBoundary>
			</div>
		</TldrawUiToastsProvider>
	)
}

function AppInner({ setAgent }: { setAgent: (agent: TldrawAgent) => void }) {
	const editor = useEditor()
	const agent = useTldrawAgent(editor, AGENT_ID)
	const { canvasId } = useParams()

	// Load document
	useEffect(() => {
		if (!editor || !canvasId) return

		const saved = loadCanvasDocument(canvasId)
		if (saved?.document) {
		editor.loadSnapshot(saved.document)
		}
	}, [editor, canvasId])

	//save document on change
	useEffect(() => {
		if (!editor || !canvasId) return

		const unsubscribe = editor.store.listen(() => {
		saveCanvasDocument({
			canvasId,
			document: editor.getSnapshot(),
			updatedAt: new Date().toISOString(),
			version: 1,
		})
		})

		return unsubscribe
	}, [editor, canvasId])

	useEffect(() => {
		if (!editor || !canvasId) return

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

					// Maintain aspect ratio
					const targetWidth = 300
					const scale = targetWidth / width
					canvas.width = targetWidth
					canvas.height = height * scale

					const ctx = canvas.getContext("2d")
					if (!ctx) return

					ctx.fillStyle = "#ffffff"
					ctx.fillRect(0, 0, canvas.width, canvas.height)

					ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

					const thumbnail = canvas.toDataURL("image/png")
					updateCanvasThumbnail(canvasId, thumbnail)

					URL.revokeObjectURL(url)
			}

			img.src = url
			}, 800)
		})

		return () => {
			unsubscribe()
			window.clearTimeout(timeout)
		}
		}, [editor, canvasId])

  
	//agent setup
	useEffect(() => {
		if (!editor || !agent) return

		setAgent(agent)
		;(window as any).editor = editor
		;(window as any).agent = agent
	}, [agent, editor, setAgent])

	return null
}

export default App
