import type { GraphSnapshot, IdeaEdge, IdeaNode, WorkspaceUiState } from '../types/graph'
import { DEFAULT_DISPLAY_FIELDS } from './status'

const nowIso = new Date().toISOString()

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export const DEFAULT_UI_STATE: WorkspaceUiState = {
  focusMode: false,
  finishMode: false,
  editLock: false,
  showIdeaSpace: true,
  addNodeDirection: 'right',
  displayFields: DEFAULT_DISPLAY_FIELDS,
  mode: 'default',
  viewport: { x: 0, y: 0, zoom: 1 },
}

export const DEFAULT_NODES: IdeaNode[] = [
  {
    id: createId('node'),
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

export const DEFAULT_IDEA_NOTE_CONTENT = '在這裡記錄你的想法、假設與下一步。'

export const DEFAULT_SNAPSHOT: GraphSnapshot = {
  nodes: DEFAULT_NODES,
  edges: DEFAULT_EDGES,
  parkingLot: [
    {
      id: 'parking-default-note',
      content: DEFAULT_IDEA_NOTE_CONTENT,
    },
  ],
  ideaSpace: {
    title: '',
    subtitle: '',
    targetDate: '',
    category: '',
    author: '',
    readOnly: false,
    password: null,
  },
  ui: DEFAULT_UI_STATE,
}
