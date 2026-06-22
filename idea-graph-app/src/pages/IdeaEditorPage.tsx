import { useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  type Edge,
  type ReactFlowInstance,
} from 'reactflow'
import { STATUS_COLOR_MAP } from '../constants/status'
import { useProjectStore } from '../store/projectStore'
import { useGraphStore } from '../store/graphStore'
import { IdeaSpace } from '../components/controls/IdeaSpace'
import { WorkspaceControls } from '../components/controls/WorkspaceControls'
import { IdeaNodeCard } from '../components/graph/IdeaNodeCard'
import { StatusLegend } from '../components/graph/StatusLegend'
import { TaskParkingLot } from '../components/tasks/TaskParkingLot'
import { NodeDetailPanel } from '../components/panels/NodeDetailPanel'
import { NodeEditModal } from '../components/panels/NodeEditModal'
import logoImage from '../assets/Logo.png'
import '../App.css'
import type { IdeaNode } from '../types/graph'

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

export default function IdeaEditorPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null)
  const hydratedProjectIdRef = useRef<string | null>(null)

  const { projects, goToList } = useProjectStore()
  const graphStore = useGraphStore()
  const nodes = graphStore.nodes
  const edges = graphStore.edges
  const parkingLot = graphStore.parkingLot
  const ideaSpace = graphStore.ideaSpace
  const ui = graphStore.ui
  const onNodesChange = graphStore.onNodesChange
  const onEdgesChange = graphStore.onEdgesChange
  const onConnect = graphStore.onConnect
  const addNodeAt = graphStore.addNodeAt
  const setSelectedNode = graphStore.setSelectedNode
  const setSelectedEdge = graphStore.setSelectedEdge
  const selectedEdgeId = graphStore.selectedEdgeId
  const updateEdgeStyle = graphStore.updateEdgeStyle
  const removeSelectedEdge = graphStore.removeSelectedEdge
  const removeSelectedNode = graphStore.removeSelectedNode
  const undo = graphStore.undo

  const currentProject = useMemo(() => {
    if (!projectId) {
      return undefined
    }
    return projects.find((project) => project.id === projectId)
  }, [projectId, projects])

  useEffect(() => {
    if (!projectId) {
      navigate('/')
      return
    }

    if (!currentProject) {
      navigate('/')
      return
    }

    if (hydratedProjectIdRef.current === projectId) {
      return
    }

    useProjectStore.getState().goToEditor(projectId)
    graphStore.loadSnapshot(currentProject.snapshot)
    hydratedProjectIdRef.current = projectId
    setHasHydrated(true)
  }, [projectId, currentProject, navigate, graphStore])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    // Avoid high-frequency writes while dragging nodes; save once after drag ends.
    if (nodes.some((node) => Boolean(node.dragging))) {
      return
    }

    if (projectId) {
      const { updateProjectSnapshot } = useProjectStore.getState()
      updateProjectSnapshot(projectId, { nodes, edges, parkingLot, ideaSpace, ui })
    }
  }, [projectId, edges, hasHydrated, nodes, parkingLot, ideaSpace, ui])

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
    const nodeById = new Map(nodes.map((node) => [node.id, node]))
    const nodeIds = new Set(renderedNodes.map((node) => node.id))

    return edges
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge) => {
        const targetNode = nodeById.get(edge.target)
        const color = targetNode
          ? targetNode.data.status === 'open'
            ? '#94a3b8'
            : STATUS_COLOR_MAP[targetNode.data.status]
          : '#94a3b8'
        const lineStyle = edge.data?.lineStyle ?? 'solid'
        const arrowStyle = edge.data?.arrowStyle ?? 'none'

        return {
          ...edge,
          style: {
            ...(edge.style ?? {}),
            stroke: color,
            strokeWidth: 2,
            strokeDasharray: lineStyle === 'dashed' ? '8 6' : undefined,
          },
          markerEnd: arrowStyle === 'arrow' ? { type: MarkerType.ArrowClosed, color } : undefined,
        }
      })
  }, [edges, nodes, renderedNodes])

  const selectedEdge = useMemo(
    () => (selectedEdgeId ? edges.find((edge) => edge.id === selectedEdgeId) : undefined),
    [edges, selectedEdgeId],
  )

  if (!projectId) return null

  if (!currentProject) {
    return <div className="app-shell">載入中...</div>
  }

  return (
    <main className={`app-shell${isLeftPanelCollapsed ? ' app-shell--left-collapsed' : ''}`}>
      {!isLeftPanelCollapsed && (
        <aside className="left-panel">
          <img className="goal-logo" src={logoImage} alt="Idea Execution Graph" />
          <section className="panel">
            <button
              type="button"
              className="left-menu-back-button"
              onClick={() => {
                goToList()
                navigate('/')
              }}
              title="返回列表"
            >
              ← 返回列表
            </button>
          </section>
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
        {selectedEdge ? (
          <div className="edge-style-panel" onClick={(event) => event.stopPropagation()}>
            <p>Edge Style</p>
            <label>
              Line
              <select
                value={selectedEdge.data?.lineStyle ?? 'solid'}
                onChange={(event) =>
                  updateEdgeStyle(selectedEdge.id, {
                    lineStyle: event.target.value as 'solid' | 'dashed',
                  })
                }
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
              </select>
            </label>
            <label>
              Arrow
              <select
                value={selectedEdge.data?.arrowStyle ?? 'none'}
                onChange={(event) =>
                  updateEdgeStyle(selectedEdge.id, {
                    arrowStyle: event.target.value as 'none' | 'arrow',
                  })
                }
              >
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
              </select>
            </label>
          </div>
        ) : null}
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
            useGraphStore.setState({ ui: { ...ui, viewport } })
          }}
          onMoveEnd={(_, viewport) => {
            useGraphStore.setState({ ui: { ...ui, viewport } })
          }}
        >
          <MiniMap zoomable pannable />
          <Controls />
          <Background />
        </ReactFlow>

        <NodeDetailPanel />
        <NodeEditModal />
      </section>
    </main>
  )
}
