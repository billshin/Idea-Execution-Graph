import { create } from 'zustand'
import type { Connection, EdgeChange, NodeChange, XYPosition } from 'reactflow'
import { addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow'
import { DEFAULT_EDGES, DEFAULT_NODES, DEFAULT_UI_STATE } from '../constants/defaults'
import { isIdeaStatus } from '../constants/status'
import type {
  GraphSnapshot,
  IdeaEdge,
  IdeaNode,
  IdeaNodeData,
  ParkingLotItem,
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
  removeEdge: (edgeId: string) => void
  removeSelectedEdge: () => void
  removeNode: (nodeId: string) => void
  removeSelectedNode: () => void
  setSelectedNode: (nodeId?: string) => void
  setSelectedEdge: (edgeId?: string) => void
  updateNode: (nodeId: string, patch: Partial<IdeaNodeData>) => void
  toggleNodeCollapsed: (nodeId: string) => void
  toggleAllCollapsed: (collapsed: boolean) => void
  setFocusMode: (enabled: boolean) => void
  setFinishMode: (enabled: boolean) => void
  setEditLock: (enabled: boolean) => void
  setDisplayField: (field: keyof WorkspaceUiState['displayFields'], value: boolean) => void
  setEdgeTransparency: (value: WorkspaceUiState['edgeTransparency']) => void
  addParkingItem: (title: string, note: string) => void
  removeParkingItem: (itemId: string) => void
  convertParkingItemToTask: (itemId: string, nodeId: string) => void
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

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  parkingLot: [],
  ui: DEFAULT_UI_STATE,
  selectedNodeId: DEFAULT_NODES[0]?.id,
  selectedEdgeId: undefined,
  editingNodeId: undefined,
  undoStack: [],

  onNodesChange: (changes) => {
    const shouldRecordHistory = changes.some((change) => change.type !== 'select')

    set((state) => {
      const nextNodes = applyNodeChanges(changes, state.nodes)
      return {
        nodes: nextNodes,
        undoStack: shouldRecordHistory ? pushUndoStack(state) : state.undoStack,
      }
    })
  },

  onEdgesChange: (changes) => {
    const shouldRecordHistory = changes.some((change) => change.type !== 'select')

    set((state) => {
      const nextEdges = applyEdgeChanges(changes, state.edges)
      return {
        edges: nextEdges,
        undoStack: shouldRecordHistory ? pushUndoStack(state) : state.undoStack,
      }
    })
  },

  onConnect: (connection) => {
    set((state) => ({
      undoStack: pushUndoStack(state),
      edges: addEdge({ ...connection, id: createId('edge') }, state.edges),
    }))
  },

  addNodeAt: (position, parentId) => {
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
      },
    }

    set((state) => {
      const edges = parentId
        ? addEdge({ id: createId('edge'), source: parentId, target: id }, state.edges)
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
      const source = state.nodes.find((node) => node.id === sourceId)
      if (!source) {
        return state
      }

      const id = createId('node')
      const nextNode: IdeaNode = {
        id,
        type: 'ideaNode',
        position: { x: source.position.x + 260, y: source.position.y + 40 },
        data: {
          ...source.data,
          title: 'START',
          subtitle: 'New Branch',
          status: 'open',
          labels: [],
          isFocusPath: false,
          tasks: [],
          files: [],
          collapsed: false,
          hiddenTaskCount: 0,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        },
      }

      return {
        undoStack: pushUndoStack(state),
        nodes: [...state.nodes, nextNode],
        edges: addEdge({ id: createId('edge'), source: sourceId, target: id }, state.edges),
        selectedNodeId: id,
        selectedEdgeId: undefined,
      }
    })
  },

  removeEdge: (edgeId) => {
    set((state) => ({
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
    set((state) => ({
      undoStack: pushUndoStack(state),
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? undefined : state.selectedNodeId,
      selectedEdgeId: undefined,
      editingNodeId: state.editingNodeId === nodeId ? undefined : state.editingNodeId,
    }))
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
    set((state) => ({
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
    }))
  },

  toggleNodeCollapsed: (nodeId) => {
    set((state) => ({
      undoStack: pushUndoStack(state),
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, collapsed: !node.data.collapsed, updatedAt: nowIso() } }
          : node,
      ),
    }))
  },

  toggleAllCollapsed: (collapsed) => {
    set((state) => ({
      undoStack: pushUndoStack(state),
      nodes: state.nodes.map((node) => ({
        ...node,
        data: { ...node.data, collapsed, updatedAt: nowIso() },
      })),
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

  setEdgeTransparency: (value) => {
    set((state) => ({ ui: { ...state.ui, edgeTransparency: value } }))
  },

  addParkingItem: (title, note) => {
    set((state) => ({
      undoStack: pushUndoStack(state),
      parkingLot: [...state.parkingLot, { id: createId('parking'), title, note }],
    }))
  },

  removeParkingItem: (itemId) => {
    set((state) => ({
      undoStack: pushUndoStack(state),
      parkingLot: state.parkingLot.filter((item) => item.id !== itemId),
    }))
  },

  convertParkingItemToTask: (itemId, nodeId) => {
    set((state) => {
      const item = state.parkingLot.find((parkingItem) => parkingItem.id === itemId)
      if (!item) {
        return state
      }

      return {
        undoStack: pushUndoStack(state),
        parkingLot: state.parkingLot.filter((parkingItem) => parkingItem.id !== itemId),
        nodes: state.nodes.map((node) => {
          if (node.id !== nodeId) {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              tasks: [
                ...node.data.tasks,
                {
                  id: createId('task'),
                  title: item.title,
                  required: item.note,
                  done: false,
                },
              ],
              updatedAt: nowIso(),
            },
          }
        }),
      }
    })
  },

  openNodeEditor: (nodeId) => {
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
      edges: snapshot.edges,
      parkingLot: snapshot.parkingLot,
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
