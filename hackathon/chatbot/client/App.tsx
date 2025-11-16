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
import { enableLinedFillStyle } from './enableLinedFillStyle'
import { TargetAreaTool } from './tools/TargetAreaTool'
import { TargetShapeTool } from './tools/TargetShapeTool'

/**
 * The ID used for this project's agent.
 * If you want to support multiple agents, you can use a different ID for each agent.
 */
export const AGENT_ID = 'agent-starter'

// Customize tldraw's styles to play to the agent's strengths
DefaultSizeStyle.setDefaultValue('s')
enableLinedFillStyle()

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
						persistenceKey="tldraw-agent-demo"
						tools={tools}
						overrides={overrides}
						components={components}
					>
						<AppInner setAgent={setAgent} />
					</Tldraw>
				</div>
				{/* <ErrorBoundary fallback={ChatPanelFallback}>
					{agent && <ChatPanel agent={agent} />}
				</ErrorBoundary> */}
			</div>
		</TldrawUiToastsProvider>
	)
}

function AppInner({ setAgent }: { setAgent: (agent: TldrawAgent) => void }) {
	const editor = useEditor()
	const agent = useTldrawAgent(editor, AGENT_ID)

	useEffect(() => {
		if (!editor || !agent) return

		setAgent(agent)
		;(window as any).editor = editor
		;(window as any).agent = agent

		let lastPromptId: number | null = null
		let cancelled = false

		// Poll the JSON file every second
		const interval = setInterval(async () => {
			if (cancelled) return

			try {
				// cache-buster query so we always get the latest file
				const res = await fetch('actions.json?ts=' + Date.now())
				console.log("FETCHED actions.json:", res.status)
				
				if (!res.ok) return

				const data = await res.json() as {
					id?: number
					message?: string
				}

				if (!data.message) return

				// Only send if this is a new prompt
				if (data.id != null && data.id === lastPromptId) return
				lastPromptId = data.id ?? null

				console.log('Sending prompt to agent:', data)

				await agent.prompt({
					type: 'user',
					message: data.message,
					contextItems: [],
					bounds: editor.getViewportPageBounds(),
					modelName: agent.$modelName.get(),
					selectedShapes: [],
				})
			} catch (err) {
				// It's fine if the file doesn't exist yet or is mid-write
				console.warn('Waiting for agent_prompt.json…', err)
			}
		}, 1000)

		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [agent, editor, setAgent])

	return null
}

export default App
