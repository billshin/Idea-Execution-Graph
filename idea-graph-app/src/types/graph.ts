import type { Edge, Node, XYPosition } from 'reactflow'

export type IdeaStatus =
  | 'open'
  | 'doing'
  | 'wait'
  | 'hold'
  | 'finish'
  | 'fail'
  | 'cancel'

export type EdgeTransparency = 'high' | 'medium' | 'low'

export type DisplayField =
  | 'label'
  | 'title'
  | 'subtitle'
  | 'targetDate'
  | 'conclusion'
  | 'taskList'

export interface FileReference {
  id: string
  name: string
  url: string
}

export interface NodeTask {
  id: string
  title: string
  required: string
  done: boolean
}

export interface ParkingLotItem {
  id: string
  title: string
  note: string
}

export interface IdeaNodeData {
  title: string
  subtitle: string
  conclusion: string
  content: string
  status: IdeaStatus
  labels: string[]
  isFocusPath: boolean
  targetDate?: string
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
  files: FileReference[]
  tasks: NodeTask[]
  collapsed: boolean
  hiddenTaskCount: number
}

export type IdeaNode = Node<IdeaNodeData>
export type IdeaEdge = Edge

export interface WorkspaceUiState {
  focusMode: boolean
  finishMode: boolean
  editLock: boolean
  edgeTransparency: EdgeTransparency
  displayFields: Record<DisplayField, boolean>
  mode: 'default' | 'focus' | 'finish'
  viewport: {
    x: number
    y: number
    zoom: number
  }
}

export interface GraphSnapshot {
  nodes: IdeaNode[]
  edges: IdeaEdge[]
  parkingLot: ParkingLotItem[]
  ui: WorkspaceUiState
}

export interface AddNodeInput {
  position: XYPosition
  parentId?: string
}
