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
import { hasProtectedPassword, resolveDefaultProjectAccessMode, resolveProjectAccessModeFromPassword } from '../utils/projectAccess'

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
  const nodes = useGraphStore((state) => state.nodes)
  const edges = useGraphStore((state) => state.edges)
  const parkingLot = useGraphStore((state) => state.parkingLot)
  const ideaSpace = useGraphStore((state) => state.ideaSpace)
  const accessMode = useGraphStore((state) => state.accessMode)
  const ui = useGraphStore((state) => state.ui)
  const onNodesChange = useGraphStore((state) => state.onNodesChange)
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange)
  const onConnect = useGraphStore((state) => state.onConnect)
  const addNodeAt = useGraphStore((state) => state.addNodeAt)
  const setSelectedNode = useGraphStore((state) => state.setSelectedNode)
  const setSelectedEdge = useGraphStore((state) => state.setSelectedEdge)
  const selectedEdgeId = useGraphStore((state) => state.selectedEdgeId)
  const updateEdgeStyle = useGraphStore((state) => state.updateEdgeStyle)
  const removeSelectedEdge = useGraphStore((state) => state.removeSelectedEdge)
  const removeSelectedNode = useGraphStore((state) => state.removeSelectedNode)
  const undo = useGraphStore((state) => state.undo)
  const loadGraphSnapshot = useGraphStore((state) => state.loadSnapshot)
  const setAccessMode = useGraphStore((state) => state.setAccessMode)

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

    let cancelled = false

    const hydrate = async () => {
      hydratedProjectIdRef.current = projectId
      useProjectStore.getState().goToEditor(projectId)

      let resolvedMode = resolveDefaultProjectAccessMode(currentProject)

      if (hasProtectedPassword(currentProject)) {
        const input = window.prompt('此專案已設定密碼。\n輸入密碼可進入編輯模式，取消則以訪客唯讀模式開啟。')

        if (input) {
          const passwordMode = await resolveProjectAccessModeFromPassword(currentProject, input)
          if (passwordMode) {
            resolvedMode = passwordMode
          } else {
            window.alert('密碼錯誤，將以訪客唯讀模式開啟。')
            resolvedMode = 'read-only'
          }
        } else {
          resolvedMode = 'read-only'
        }
      }

      useProjectStore.getState().setProjectAccessMode(projectId, resolvedMode)

      if (cancelled) {
        return
      }

      loadGraphSnapshot(currentProject.snapshot)
      setAccessMode(resolvedMode)
      setHasHydrated(true)
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [projectId, navigate, loadGraphSnapshot, setAccessMode])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    if (accessMode === 'read-only') {
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
  }, [projectId, edges, hasHydrated, nodes, parkingLot, ideaSpace, ui, accessMode])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditingInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable

      if (event.key === 'Escape') {
        setSelectedNode(undefined)
        setSelectedEdge(undefined)
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isEditingInput) {
        event.preventDefault()
        undo()
      }

      if (event.key === 'Delete' && !isEditingInput) {
        if (accessMode === 'read-only') {
          return
        }

        removeSelectedEdge()
        removeSelectedNode()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [removeSelectedEdge, removeSelectedNode, setSelectedEdge, setSelectedNode, undo, accessMode])

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
        const isSelected = edge.id === selectedEdgeId
        const targetNode = nodeById.get(edge.target)
        const baseColor = targetNode
          ? targetNode.data.status === 'open'
            ? '#94a3b8'
            : STATUS_COLOR_MAP[targetNode.data.status]
          : '#94a3b8'
        const strokeColor = baseColor
        const lineStyle = edge.data?.lineStyle ?? 'solid'
        const arrowStyle = edge.data?.arrowStyle ?? 'none'
        const resolvedArrowStyle = arrowStyle === 'arrow' ? 'forward' : arrowStyle

        return {
          ...edge,
          animated: isSelected,
          zIndex: isSelected ? 20 : 1,
          style: {
            ...(edge.style ?? {}),
            stroke: strokeColor,
            strokeWidth: isSelected ? 4 : 2,
            strokeDasharray: lineStyle === 'dashed' ? '8 6' : undefined,
            filter: isSelected ? 'drop-shadow(0 0 4px rgba(15, 23, 42, 0.35))' : undefined,
          },
          markerStart: resolvedArrowStyle === 'reverse' || resolvedArrowStyle === 'both' ? { type: MarkerType.ArrowClosed, color: strokeColor } : undefined,
          markerEnd: resolvedArrowStyle === 'forward' || resolvedArrowStyle === 'both' ? { type: MarkerType.ArrowClosed, color: strokeColor } : undefined,
        }
      })
  }, [edges, nodes, renderedNodes, selectedEdgeId])

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
        {ui.showIdeaSpace && (
          <div className="collapsed-idea-space">
            <p className="collapsed-idea-space-title">{ideaSpace.title || '新想法'}</p>
            <p className="collapsed-idea-space-subtitle">{ideaSpace.subtitle || '為了什麼目的'}</p>
          </div>
        )}
        {selectedEdge ? (
          <div className="edge-style-panel" onClick={(event) => event.stopPropagation()}>
            <p>Edge Style</p>
            <div className="edge-style-group">
              <span>Line</span>
              <div className="edge-style-radios">
                <label>
                  <input
                    type="radio"
                    name="edge-line-style"
                    checked={(selectedEdge.data?.lineStyle ?? 'solid') === 'solid'}
                    disabled={accessMode === 'read-only'}
                    onChange={() =>
                      updateEdgeStyle(selectedEdge.id, {
                        lineStyle: 'solid',
                      })
                    }
                  />
                  Solid
                </label>
                <label>
                  <input
                    type="radio"
                    name="edge-line-style"
                    checked={selectedEdge.data?.lineStyle === 'dashed'}
                    disabled={accessMode === 'read-only'}
                    onChange={() =>
                      updateEdgeStyle(selectedEdge.id, {
                        lineStyle: 'dashed',
                      })
                    }
                  />
                  Dashed
                </label>
              </div>
            </div>
            <div className="edge-style-group">
              <span>Arrow</span>
              <div className="edge-style-radios">
                <label>
                  <input
                    type="radio"
                    name="edge-arrow-style"
                    checked={(selectedEdge.data?.arrowStyle ?? 'none') === 'none'}
                    disabled={accessMode === 'read-only'}
                    onChange={() =>
                      updateEdgeStyle(selectedEdge.id, {
                        arrowStyle: 'none',
                      })
                    }
                  />
                  None
                </label>
                <label>
                  <input
                    type="radio"
                    name="edge-arrow-style"
                    checked={(selectedEdge.data?.arrowStyle ?? 'none') === 'forward' || selectedEdge.data?.arrowStyle === 'arrow'}
                    disabled={accessMode === 'read-only'}
                    onChange={() =>
                      updateEdgeStyle(selectedEdge.id, {
                        arrowStyle: 'forward',
                      })
                    }
                  />
                  Forward
                </label>
                <label>
                  <input
                    type="radio"
                    name="edge-arrow-style"
                    checked={selectedEdge.data?.arrowStyle === 'reverse'}
                    disabled={accessMode === 'read-only'}
                    onChange={() =>
                      updateEdgeStyle(selectedEdge.id, {
                        arrowStyle: 'reverse',
                      })
                    }
                  />
                  Reverse
                </label>
                <label>
                  <input
                    type="radio"
                    name="edge-arrow-style"
                    checked={selectedEdge.data?.arrowStyle === 'both'}
                    disabled={accessMode === 'read-only'}
                    onChange={() =>
                      updateEdgeStyle(selectedEdge.id, {
                        arrowStyle: 'both',
                      })
                    }
                  />
                  Both
                </label>
              </div>
            </div>
          </div>
        ) : null}
        <ReactFlow
          nodes={renderedNodes}
          edges={renderedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesDraggable={accessMode !== 'read-only'}
          nodesConnectable={accessMode !== 'read-only'}
          fitView
          onPaneClick={(event: ReactMouseEvent) => {
            if (event.target !== event.currentTarget) {
              return
            }

            // Clicking empty canvas should clear current selections.
            setSelectedNode(undefined)

            if (accessMode === 'read-only') {
              return
            }

            if (event.detail < 2) {
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
