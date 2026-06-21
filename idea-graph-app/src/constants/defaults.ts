import type { GraphSnapshot, IdeaEdge, IdeaNode, WorkspaceUiState } from '../types/graph'
import { DEFAULT_DISPLAY_FIELDS } from './status'

const nowIso = new Date().toISOString()

export const DEFAULT_UI_STATE: WorkspaceUiState = {
  focusMode: false,
  finishMode: false,
  editLock: false,
  edgeTransparency: 'high',
  displayFields: DEFAULT_DISPLAY_FIELDS,
  mode: 'default',
  viewport: { x: 0, y: 0, zoom: 1 },
}

export const DEFAULT_NODES: IdeaNode[] = [
  {
    id: 'node-start',
    type: 'ideaNode',
    position: { x: 120, y: 120 },
    data: {
      title: 'New Idea',
      subtitle: '開始建立新想法',
      conclusion: '',
      content: '',
      status: 'open',
      labels: ['Start'],
      isFocusPath: true,
      targetDate: '',
      startDate: nowIso.slice(0, 10),
      endDate: '',
      createdAt: nowIso,
      updatedAt: nowIso,
      files: [],
      tasks: [],
      collapsed: false,
      hiddenTaskCount: 0,
      hiddenDoneTaskCount: 0,
    },
  },
]

export const DEFAULT_EDGES: IdeaEdge[] = []

export const DEFAULT_SNAPSHOT: GraphSnapshot = {
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  parkingLot: [],
  ui: DEFAULT_UI_STATE,
}
