import { create } from 'zustand'
import type { Connection, EdgeChange, NodeChange, XYPosition } from 'reactflow'
import { addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow'
import { DEFAULT_EDGES, DEFAULT_NODES, DEFAULT_UI_STATE } from '../constants/defaults'
import { DEFAULT_SNAPSHOT } from '../constants/defaults'
import { isIdeaStatus } from '../constants/status'
import type {
  GraphSnapshot,
  IdeaEdge,
  IdeaEdgeData,
  IdeaNode,
  IdeaNodeData,
  IdeaSpaceData,
  ParkingLotItem,
  ProjectAccessMode,
  WorkspaceUiState,
} from '../types/graph'

const HISTORY_LIMIT = 50

interface HistoryEntry {
  nodes: IdeaNode[]
  edges: IdeaEdge[]
  parkingLot: ParkingLotItem[]
  selectedNodeId?: string
}

interface GraphState {
  nodes: IdeaNode[]
  edges: IdeaEdge[]
  parkingLot: ParkingLotItem[]
  ideaSpace: IdeaSpaceData
  accessMode: ProjectAccessMode
  ui: WorkspaceUiState
  selectedNodeId?: string
  selectedEdgeId?: string
  editingNodeId?: string
  undoStack: HistoryEntry[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNodeAt: (position: XYPosition, parentId?: string) => void
  addConnectedNode: (sourceId: string) => void
  addConnectedNodeAbove: (sourceId: string) => void
  addConnectedNodeBelow: (sourceId: string) => void
  updateEdgeStyle: (edgeId: string, patch: Partial<IdeaEdgeData>) => void
  removeEdge: (edgeId: string) => void
  removeSelectedEdge: () => void
  removeNode: (nodeId: string) => void
  removeSelectedNode: () => void
  setSelectedNode: (nodeId?: string) => void
  setSelectedEdge: (edgeId?: string) => void
  updateNode: (nodeId: string, patch: Partial<IdeaNodeData>) => void
  toggleNodeCollapsed: (nodeId: string) => void
  toggleAllCollapsed: (collapsed: boolean) => void
  setMode: (mode: WorkspaceUiState['mode']) => void
  setFocusMode: (enabled: boolean) => void
  setFinishMode: (enabled: boolean) => void
  setEditLock: (enabled: boolean) => void
  setShowIdeaSpace: (enabled: boolean) => void
  setAddNodeDirection: (direction: WorkspaceUiState['addNodeDirection']) => void
  setDisplayField: (field: keyof WorkspaceUiState['displayFields'], value: boolean) => void
  addParkingItem: (content: string) => void
  updateParkingItem: (itemId: string, content: string) => void
  removeParkingItem: (itemId: string) => void
  updateIdeaSpace: (patch: Partial<IdeaSpaceData>) => void
  setAccessMode: (mode: ProjectAccessMode) => void
  openNodeEditor: (nodeId: string) => void
  closeNodeEditor: () => void
  undo: () => void
  loadSnapshot: (snapshot: GraphSnapshot) => void
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function nowIso(): string {
  return new Date().toISOString()
}

const DEFAULT_EDGE_DATA: IdeaEdgeData = {
  lineStyle: 'solid',
  arrowStyle: 'none',
}

function normalizeArrowStyle(style: IdeaEdgeData['arrowStyle'] | undefined): IdeaEdgeData['arrowStyle'] {
  if (style === 'arrow') {
    return 'forward'
  }
  return style ?? 'none'
}

function normalizeEdge(edge: IdeaEdge): IdeaEdge {
  return {
    ...edge,
    sourceHandle: edge.sourceHandle ?? 'source-right',
    targetHandle: edge.targetHandle ?? 'target-left',
    data: {
      ...DEFAULT_EDGE_DATA,
      ...(edge.data ?? {}),
      arrowStyle: normalizeArrowStyle(edge.data?.arrowStyle),
    },
  }
}

function createStyledEdge(
  source: string,
  target: string,
  sourceHandle = 'source-right',
  targetHandle = 'target-left',
): IdeaEdge {
  return {
    id: createId('edge'),
    source,
    target,
    sourceHandle,
    targetHandle,
    data: { ...DEFAULT_EDGE_DATA },
  }
}

function addDirectionalConnectedNode(state: GraphState, sourceId: string, direction: 'above' | 'below') {
  const source = state.nodes.find((node) => node.id === sourceId)
  if (!source) {
    return state
  }

  const siblingsInDirection = state.edges
    .filter((edge) => edge.source === sourceId)
    .map((edge) => state.nodes.find((node) => node.id === edge.target))
    .filter((node): node is IdeaNode => Boolean(node))
    .filter((node) =>
      direction === 'above' ? node.position.y < source.position.y : node.position.y >= source.position.y,
    ).length

  const yOffsetBase = 180
  const yOffsetStep = 20
  const yOffset = yOffsetBase + siblingsInDirection * yOffsetStep

  const id = createId('node')
  const nextNode: IdeaNode = {
    id,
    type: 'ideaNode',
    position: {
      x: source.position.x + 20,
      y: direction === 'above' ? source.position.y - yOffset : source.position.y + yOffset,
    },
    data: {
      ...source.data,
      title: direction === 'above' ? '前置步驟' : '後續步驟',
      subtitle: direction === 'above' ? '這一步之前要先完成什麼?' : '下一步要做什麼?',
      status: 'open',
      labels: direction === 'above' ? ['upstream'] : ['downstream'],
      isFocusPath: false,
      tasks: [],
      files: [],
      collapsed: false,
      hiddenTaskCount: 0,
      hiddenDoneTaskCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  }

  return {
    undoStack: pushUndoStack(state),
    nodes: [...state.nodes, nextNode],
    edges: addEdge(
      createStyledEdge(
        sourceId,
        id,
        direction === 'above' ? 'source-top' : 'source-bottom',
        'target-top',
      ),
      state.edges,
    ),
    selectedNodeId: id,
    selectedEdgeId: undefined,
  }
}

function cloneSnapshot(
  nodes: IdeaNode[],
  edges: IdeaEdge[],
  parkingLot: ParkingLotItem[],
  selectedNodeId?: string,
): HistoryEntry {
  return {
    nodes: structuredClone(nodes),
    edges: structuredClone(edges),
    parkingLot: structuredClone(parkingLot),
    selectedNodeId,
  }
}

function pushUndoStack(state: GraphState): HistoryEntry[] {
  const next = [...state.undoStack, cloneSnapshot(state.nodes, state.edges, state.parkingLot, state.selectedNodeId)]
  if (next.length > HISTORY_LIMIT) {
    return next.slice(next.length - HISTORY_LIMIT)
  }
  return next
}

function isReadOnlyMode(state: GraphState): boolean {
  return state.accessMode === 'read-only'
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  parkingLot: [],
  ideaSpace: structuredClone(DEFAULT_SNAPSHOT.ideaSpace),
  accessMode: 'edit',
  ui: DEFAULT_UI_STATE,
  selectedNodeId: DEFAULT_NODES[0]?.id,
  selectedEdgeId: undefined,
  editingNodeId: undefined,
  undoStack: [],

  onNodesChange: (changes) => {
    const shouldRecordHistory = changes.some((change) => change.type !== 'select')

    set((state) => {
      const allowedChanges = isReadOnlyMode(state) ? changes.filter((change) => change.type === 'select') : changes
      const nextNodes = applyNodeChanges(allowedChanges, state.nodes)
      return {
        nodes: nextNodes,
        undoStack: !isReadOnlyMode(state) && shouldRecordHistory ? pushUndoStack(state) : state.undoStack,
      }
    })
  },

  onEdgesChange: (changes) => {
    const shouldRecordHistory = changes.some((change) => change.type !== 'select')

    set((state) => {
      const allowedChanges = isReadOnlyMode(state) ? changes.filter((change) => change.type === 'select') : changes
      const nextEdges = applyEdgeChanges(allowedChanges, state.edges)
      return {
        edges: nextEdges,
        undoStack: !isReadOnlyMode(state) && shouldRecordHistory ? pushUndoStack(state) : state.undoStack,
      }
    })
  },

  onConnect: (connection) => {
    if (!connection.source || !connection.target) {
      return
    }

    if (get().accessMode === 'read-only') {
      return
    }

    set((state) => ({
      undoStack: pushUndoStack(state),
      edges: addEdge(
        {
          ...connection,
          sourceHandle: connection.sourceHandle ?? 'source-right',
          targetHandle: connection.targetHandle ?? 'target-left',
          id: createId('edge'),
          data: { ...DEFAULT_EDGE_DATA },
        },
        state.edges,
      ),
    }))
  },

  addNodeAt: (position, parentId) => {
    if (get().accessMode === 'read-only') {
      return
    }

    const id = createId('node')
    const nextNode: IdeaNode = {
      id,
      type: 'ideaNode',
      position,
      data: {
        title: 'START',
        subtitle: parentId ? 'Follow-up idea' : 'New Idea',
        conclusion: '',
        content: '',
        status: 'open',
        labels: [],
        isFocusPath: false,
        targetDate: '',
        startDate: nowIso().slice(0, 10),
        endDate: '',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        files: [],
        tasks: [],
        collapsed: false,
        hiddenTaskCount: 0,
        hiddenDoneTaskCount: 0,
      },
    }

    set((state) => {
      const edges = parentId
        ? addEdge(createStyledEdge(parentId, id), state.edges)
        : state.edges

      return {
        undoStack: pushUndoStack(state),
        nodes: [...state.nodes, nextNode],
        edges,
        selectedNodeId: id,
        selectedEdgeId: undefined,
      }
    })
  },

  addConnectedNode: (sourceId) => {
    set((state) => {
      if (isReadOnlyMode(state)) {
        return state
      }

      const source = state.nodes.find((node) => node.id === sourceId)
      if (!source) {
        return state
      }

      const linkedChildCount = state.edges.filter((edge) => edge.source === sourceId).length
      const direction = state.ui.addNodeDirection
      const offset = 160 + linkedChildCount * 10

      const nextPosition = (() => {
        switch (direction) {
          case 'left':
            return { x: source.position.x - offset, y: source.position.y + 20 }
          case 'bottom':
            return { x: source.position.x + 20, y: source.position.y + offset }
          case 'top':
            return { x: source.position.x + 20, y: source.position.y - offset }
          case 'right':
          default:
            return { x: source.position.x + offset + 100, y: source.position.y + 20 }
        }
      })()

      const handleByDirection = (() => {
        switch (direction) {
          case 'bottom':
            return { sourceHandle: 'source-bottom', targetHandle: 'target-top' }
          case 'top':
            return { sourceHandle: 'source-bottom', targetHandle: 'target-top' }
          case 'left':
          case 'right':
          default:
            return { sourceHandle: 'source-right', targetHandle: 'target-left' }
        }
      })()

      const id = createId('node')
      const nextNode: IdeaNode = {
        id,
        type: 'ideaNode',
        position: nextPosition,
        data: {
          ...source.data,
          title: '解決方式',
          subtitle: '使用什麼方法?',
          status: 'open',
          labels: ['thinking'],
          isFocusPath: false,
          tasks: [],
          files: [],
          collapsed: false,
          hiddenTaskCount: 0,
          hiddenDoneTaskCount: 0,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      }

      return {
        undoStack: pushUndoStack(state),
        nodes: [...state.nodes, nextNode],
        edges: addEdge(
          createStyledEdge(sourceId, id, handleByDirection.sourceHandle, handleByDirection.targetHandle),
          state.edges,
        ),
        selectedNodeId: id,
        selectedEdgeId: undefined,
      }
    })
  },

  addConnectedNodeAbove: (sourceId) => {
    set((state) => (isReadOnlyMode(state) ? state : addDirectionalConnectedNode(state, sourceId, 'above')))
  },

  addConnectedNodeBelow: (sourceId) => {
    set((state) => (isReadOnlyMode(state) ? state : addDirectionalConnectedNode(state, sourceId, 'below')))
  },

  updateEdgeStyle: (edgeId, patch) => {
    const lineStyle = patch.lineStyle
    const arrowStyle = patch.arrowStyle

    const validLineStyle = !lineStyle || lineStyle === 'solid' || lineStyle === 'dashed'
    const validArrowStyle = !arrowStyle || arrowStyle === 'none' || arrowStyle === 'forward' || arrowStyle === 'reverse' || arrowStyle === 'both' || arrowStyle === 'arrow'
    if (!validLineStyle || !validArrowStyle) {
      return
    }

    set((state) => (isReadOnlyMode(state) ? state : {
      undoStack: pushUndoStack(state),
      edges: state.edges.map((edge) =>
        edge.id === edgeId
          ? {
              ...edge,
              data: {
                ...DEFAULT_EDGE_DATA,
                ...(edge.data ?? {}),
                ...patch,
                arrowStyle: normalizeArrowStyle(patch.arrowStyle ?? edge.data?.arrowStyle),
              },
            }
          : edge,
      ),
    }))
  },

  removeEdge: (edgeId) => {
    set((state) => (isReadOnlyMode(state) ? state : {
      undoStack: pushUndoStack(state),
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? undefined : state.selectedEdgeId,
    }))
  },

  removeSelectedEdge: () => {
    const selectedEdgeId = get().selectedEdgeId
    if (!selectedEdgeId) {
      return
    }

    get().removeEdge(selectedEdgeId)
  },

  removeNode: (nodeId) => {
    set((state) => {
      if (isReadOnlyMode(state)) {
        return state
      }

      const targetExists = state.nodes.some((node) => node.id === nodeId)
      if (!targetExists) {
        return state
      }

      if (state.nodes.length <= 1) {
        window.alert('至少需保留一個節點，無法刪除最後一個節點。')
        return state
      }

      return {
        undoStack: pushUndoStack(state),
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        selectedNodeId: state.selectedNodeId === nodeId ? undefined : state.selectedNodeId,
        selectedEdgeId: undefined,
        editingNodeId: state.editingNodeId === nodeId ? undefined : state.editingNodeId,
      }
    })
  },

  removeSelectedNode: () => {
    const selectedNodeId = get().selectedNodeId
    if (!selectedNodeId) {
      return
    }

    get().removeNode(selectedNodeId)
  },

  setSelectedNode: (nodeId) => {
    set({ selectedNodeId: nodeId, selectedEdgeId: undefined })
  },

  setSelectedEdge: (edgeId) => {
    set({ selectedEdgeId: edgeId, selectedNodeId: edgeId ? undefined : get().selectedNodeId })
  },

  updateNode: (nodeId, patch) => {
    set((state) => {
      if (isReadOnlyMode(state)) {
        return state
      }

      return {
      undoStack: pushUndoStack(state),
      nodes: state.nodes.map((node) => {
        if (node.id !== nodeId) {
          return node
        }

        if (patch.status && !isIdeaStatus(patch.status)) {
          return node
        }

        return {
          ...node,
          data: {
            ...node.data,
            ...patch,
            updatedAt: nowIso(),
          },
        }
      }),
    }})
  },

  toggleNodeCollapsed: (nodeId) => {
    set((state) => (isReadOnlyMode(state) ? state : {
      undoStack: pushUndoStack(state),
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, collapsed: !node.data.collapsed, updatedAt: nowIso() } }
          : node,
      ),
    }))
  },

  toggleAllCollapsed: (collapsed) => {
    set((state) => (isReadOnlyMode(state) ? state : {
      undoStack: pushUndoStack(state),
      nodes: state.nodes.map((node) => ({
        ...node,
        data: { ...node.data, collapsed, updatedAt: nowIso() },
      })),
    }))
  },

  setMode: (mode: WorkspaceUiState['mode']) => {
    set((state) => ({
      ui: {
        ...state.ui,
        mode,
        focusMode: mode === 'focus',
        finishMode: mode === 'finish',
      },
    }))
  },

  setFocusMode: (enabled) => {
    set((state) => ({
      ui: {
        ...state.ui,
        focusMode: enabled,
        mode: enabled ? 'focus' : state.ui.finishMode ? 'finish' : 'default',
      },
    }))
  },

  setFinishMode: (enabled) => {
    set((state) => ({
      ui: {
        ...state.ui,
        finishMode: enabled,
        mode: enabled ? 'finish' : state.ui.focusMode ? 'focus' : 'default',
      },
    }))
  },

  setEditLock: (enabled) => {
    set((state) => ({
      ui: {
        ...state.ui,
        editLock: enabled,
      },
    }))
  },

  setShowIdeaSpace: (enabled) => {
    set((state) => ({
      ui: {
        ...state.ui,
        showIdeaSpace: enabled,
      },
    }))
  },

  setAddNodeDirection: (direction) => {
    set((state) => ({
      ui: {
        ...state.ui,
        addNodeDirection: direction,
      },
    }))
  },

  setDisplayField: (field, value) => {
    set((state) => ({
      ui: {
        ...state.ui,
        displayFields: {
          ...state.ui.displayFields,
          [field]: value,
        },
      },
    }))
  },

  addParkingItem: (content) => {
    set((state) => (isReadOnlyMode(state) ? state : {
      undoStack: pushUndoStack(state),
      parkingLot: [...state.parkingLot, { id: createId('parking'), content }],
    }))
  },

  updateParkingItem: (itemId, content) => {
    set((state) => (isReadOnlyMode(state) ? state : {
      undoStack: pushUndoStack(state),
      parkingLot: state.parkingLot.map((item) =>
        item.id === itemId ? { ...item, content } : item,
      ),
    }))
  },

  removeParkingItem: (itemId) => {
    set((state) => (isReadOnlyMode(state) ? state : {
      undoStack: pushUndoStack(state),
      parkingLot: state.parkingLot.filter((item) => item.id !== itemId),
    }))
  },

  updateIdeaSpace: (patch) => {
    set((state) => (isReadOnlyMode(state) ? state : {
      ideaSpace: {
        ...state.ideaSpace,
        ...patch,
      },
    }))
  },

  setAccessMode: (mode) => {
    set({ accessMode: mode })
  },

  openNodeEditor: (nodeId) => {
    if (get().accessMode === 'read-only') {
      return
    }

    set({ editingNodeId: nodeId, selectedNodeId: nodeId, selectedEdgeId: undefined })
  },

  closeNodeEditor: () => {
    set({ editingNodeId: undefined })
  },

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) {
        return state
      }

      const last = state.undoStack[state.undoStack.length - 1]

      return {
        nodes: last.nodes,
        edges: last.edges,
        parkingLot: last.parkingLot,
        selectedNodeId: last.selectedNodeId,
        selectedEdgeId: undefined,
        editingNodeId: undefined,
        undoStack: state.undoStack.slice(0, -1),
      }
    })
  },

  loadSnapshot: (snapshot) => {
    set({
      nodes: snapshot.nodes,
      edges: snapshot.edges.map((edge) => normalizeEdge(edge)),
      parkingLot: snapshot.parkingLot,
      ideaSpace: snapshot.ideaSpace,
      accessMode: 'edit',
      ui: snapshot.ui,
      selectedNodeId: snapshot.nodes[0]?.id,
      selectedEdgeId: undefined,
      editingNodeId: undefined,
      undoStack: [],
    })
  },
}))

export function useSelectedNode(): IdeaNode | undefined {
  return useGraphStore((state) =>
    state.selectedNodeId ? state.nodes.find((node) => node.id === state.selectedNodeId) : undefined,
  )
}

export function useEditingNode(): IdeaNode | undefined {
  return useGraphStore((state) =>
    state.editingNodeId ? state.nodes.find((node) => node.id === state.editingNodeId) : undefined,
  )
}
