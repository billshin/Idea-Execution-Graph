import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type ReactFlowInstance,
} from 'reactflow'
import './App.css'
import logoImage from './assets/Logo.png'
import { IdeaSpace } from './components/controls/IdeaSpace'
import { WorkspaceControls } from './components/controls/WorkspaceControls'
import { IdeaNodeCard } from './components/graph/IdeaNodeCard'
import { StatusLegend } from './components/graph/StatusLegend'
import { NodeEditModal } from './components/panels/NodeEditModal'
import { TaskParkingLot } from './components/tasks/TaskParkingLot'
import { loadSnapshot, saveSnapshot } from './persistence/storage'
import { useGraphStore } from './store/graphStore'
import type { IdeaNode } from './types/graph'

const nodeTypes = {
  ideaNode: IdeaNodeCard,
}

function getDescendants(startId: string, edges: Edge[]): Set<string> {
  const childrenByParent = new Map<string, string[]>()

  for (const edge of edges) {
    const children = childrenByParent.get(edge.source) ?? []
    children.push(edge.target)
    childrenByParent.set(edge.source, children)
  }

  const descendants = new Set<string>()
  const queue = [...(childrenByParent.get(startId) ?? [])]

  while (queue.length > 0) {
    const current = queue.shift()!

    if (descendants.has(current)) {
      continue
    }

    descendants.add(current)
    queue.push(...(childrenByParent.get(current) ?? []))
  }

  return descendants
}

function getAncestorIds(seedIds: string[], edges: Edge[]): Set<string> {
  const parentByChild = new Map<string, string[]>()
  for (const edge of edges) {
    const parents = parentByChild.get(edge.target) ?? []
    parents.push(edge.source)
    parentByChild.set(edge.target, parents)
  }

  const included = new Set<string>(seedIds)
  const queue = [...seedIds]

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const parent of parentByChild.get(current) ?? []) {
      if (!included.has(parent)) {
        included.add(parent)
        queue.push(parent)
      }
    }
  }

  return included
}

function getFocusPathIds(nodes: IdeaNode[], edges: Edge[]): Set<string> {
  const seedIds = nodes.filter((node) => node.data.isFocusPath).map((node) => node.id)
  return getAncestorIds(seedIds, edges)
}

function getFinishPathIds(nodes: IdeaNode[], edges: Edge[]): Set<string> {
  const finishNodeIds = nodes.filter((node) => node.data.status === 'finish').map((node) => node.id)
  const parentByChild = new Map<string, string[]>()

  for (const edge of edges) {
    const parents = parentByChild.get(edge.target) ?? []
    parents.push(edge.source)
    parentByChild.set(edge.target, parents)
  }

  const included = new Set<string>(finishNodeIds)
  const queue = [...finishNodeIds]

  while (queue.length > 0) {
    const current = queue.shift()!
    const parents = parentByChild.get(current) ?? []

    for (const parent of parents) {
      if (!included.has(parent)) {
        included.add(parent)
        queue.push(parent)
      }
    }
  }

  return included
}

function App() {
  const [hasHydrated, setHasHydrated] = useState(false)
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null)
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const parkingLot = useGraphStore((state) => state.parkingLot)
  const ideaSpace = useGraphStore((state) => state.ideaSpace)
  const ui = useGraphStore((state) => state.ui)
  const onNodesChange = useGraphStore((state) => state.onNodesChange)
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange)
  const onConnect = useGraphStore((state) => state.onConnect)
  const addNodeAt = useGraphStore((state) => state.addNodeAt)
  const setSelectedNode = useGraphStore((state) => state.setSelectedNode)
  const setSelectedEdge = useGraphStore((state) => state.setSelectedEdge)
  const removeSelectedEdge = useGraphStore((state) => state.removeSelectedEdge)
  const removeSelectedNode = useGraphStore((state) => state.removeSelectedNode)
  const undo = useGraphStore((state) => state.undo)
  const loadStoreSnapshot = useGraphStore((state) => state.loadSnapshot)

  useEffect(() => {
    const snapshot = loadSnapshot()
    loadStoreSnapshot(snapshot)
    setHasHydrated(true)
  }, [loadStoreSnapshot])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    saveSnapshot({ nodes, edges, parkingLot, ideaSpace, ui })
  }, [edges, hasHydrated, nodes, parkingLot, ideaSpace, ui])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditingInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isEditingInput) {
        event.preventDefault()
        undo()
      }

      if (event.key === 'Delete' && !isEditingInput) {
        removeSelectedEdge()
        removeSelectedNode()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [removeSelectedEdge, removeSelectedNode, undo])

  const renderedNodes = useMemo(() => {
    const visibleIds = new Set<string>(nodes.map((node) => node.id))

    if (ui.focusMode) {
      const focusPathIds = getFocusPathIds(nodes, edges)
      for (const id of visibleIds) {
        if (!focusPathIds.has(id)) {
          visibleIds.delete(id)
        }
      }
    }

    if (ui.finishMode) {
      const finishPathIds = getFinishPathIds(nodes, edges)
      for (const id of visibleIds) {
        if (!finishPathIds.has(id)) {
          visibleIds.delete(id)
        }
      }
    }

    const hiddenByCollapse = new Set<string>()
    for (const node of nodes) {
      if (node.data.collapsed) {
        const descendants = getDescendants(node.id, edges)
        descendants.forEach((id) => hiddenByCollapse.add(id))
      }
    }

    for (const hiddenId of hiddenByCollapse) {
      visibleIds.delete(hiddenId)
    }

    return nodes
      .filter((node) => visibleIds.has(node.id))
      .map((node): IdeaNode => {
        if (!node.data.collapsed) {
          return { ...node, data: { ...node.data, hiddenTaskCount: 0, hiddenDoneTaskCount: 0 } }
        }

        const descendants = getDescendants(node.id, edges)
        let hiddenTaskCount = 0
        let hiddenDoneTaskCount = 0

        for (const descendantId of descendants) {
          const descendant = nodes.find((entry) => entry.id === descendantId)
          const tasks = descendant?.data.tasks ?? []
          hiddenTaskCount += tasks.length
          hiddenDoneTaskCount += tasks.filter((task) => task.done).length
        }

        return {
          ...node,
          data: {
            ...node.data,
            hiddenTaskCount,
            hiddenDoneTaskCount,
          },
        }
      })
  }, [edges, nodes, ui.finishMode, ui.focusMode])

  const renderedEdges = useMemo(() => {
    const nodeIds = new Set(renderedNodes.map((node) => node.id))
    return edges
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge) => ({ ...edge }))
  }, [edges, renderedNodes])

  return (
    <main className={`app-shell${isLeftPanelCollapsed ? ' app-shell--left-collapsed' : ''}`}>
      {!isLeftPanelCollapsed && (
        <aside className="left-panel">
          {/* <section className="panel goal-panel">
            <img className="goal-logo" src={logoImage} alt="Idea Execution Graph" />
            <p>Goal: Build and finish your idea step by step.</p>
          </section> */}
           <img className="goal-logo" src={logoImage} alt="Idea Execution Graph" />
          <IdeaSpace />
          <WorkspaceControls />
          <StatusLegend />
          <TaskParkingLot />
        </aside>
      )}

      <section className="canvas-wrap">
        <button
          type="button"
          className="left-panel-toggle"
          onClick={() => setIsLeftPanelCollapsed((value) => !value)}
          aria-label={isLeftPanelCollapsed ? 'Expand left panel' : 'Collapse left panel'}
        >
          {isLeftPanelCollapsed ? '📘 展開側欄' : '📖 收合側欄'}
        </button>
        <div className="collapsed-idea-space">
          <p className="collapsed-idea-space-title">{ideaSpace.title || '新想法'}</p>
          <p className="collapsed-idea-space-subtitle">{ideaSpace.subtitle || '為了什麼目的'}</p>
        </div>
        <ReactFlow
          nodes={renderedNodes}
          edges={renderedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          onPaneClick={(event: ReactMouseEvent) => {
            if (event.detail < 2 || event.target !== event.currentTarget) {
              return
            }

            if (!flowInstanceRef.current) {
              return
            }

            const position = flowInstanceRef.current.project({
              x: event.clientX,
              y: event.clientY,
            })
            addNodeAt(position)
          }}
          onNodeClick={(_, node) => setSelectedNode(node.id)}
          onEdgeClick={(_, edge) => setSelectedEdge(edge.id)}
          onInit={(instance: ReactFlowInstance) => {
            flowInstanceRef.current = instance
            const viewport = instance.getViewport()
            useGraphStore.setState((state) => ({ ui: { ...state.ui, viewport } }))
          }}
          onMoveEnd={(_, viewport) => {
            useGraphStore.setState((state) => ({ ui: { ...state.ui, viewport } }))
          }}
        >
          <MiniMap zoomable pannable />
          <Controls />
          <Background />
        </ReactFlow>
      </section>

      <NodeEditModal />
    </main>
  )
}

export default App
