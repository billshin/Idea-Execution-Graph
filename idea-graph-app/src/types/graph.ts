import type { Edge, Node, XYPosition } from 'reactflow'

export type IdeaStatus =
  | 'open'
  | 'doing'
  | 'wait'
  | 'hold'
  | 'finish'
  | 'fail'
  | 'cancel'

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
  category: string
  conclusion: string
  done: boolean
}

export interface ParkingLotItem {
  id: string
  content: string
}

export interface PasswordHashValue {
  salt: string
  hash: string
}

export type ProjectAccessMode = 'edit' | 'read-only'

export interface IdeaSpaceData {
  title: string
  subtitle: string
  targetDate: string
  category: string
  author: string
  readOnly: boolean
  password: PasswordHashValue | null
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
  hiddenDoneTaskCount: number
}

export type EdgeLineStyle = 'solid' | 'dashed'
export type EdgeArrowStyle = 'none' | 'forward' | 'reverse' | 'both' | 'arrow'

export interface IdeaEdgeData {
  lineStyle: EdgeLineStyle
  arrowStyle: EdgeArrowStyle
}

export type IdeaNode = Node<IdeaNodeData>
export type IdeaEdge = Edge<IdeaEdgeData>

export interface WorkspaceUiState {
  focusMode: boolean
  finishMode: boolean
  editLock: boolean
  showIdeaSpace: boolean
  taskShowLimit: number
  addNodeDirection: 'right' | 'left' | 'bottom' | 'top'
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
  ideaSpace: IdeaSpaceData
  ui: WorkspaceUiState
}

export interface AddNodeInput {
  position: XYPosition
  parentId?: string
}

export interface IdeaProject {
  id: string
  title: string
  subtitle: string
  createdAt: string
  updatedAt: string
  snapshot: GraphSnapshot
}

export interface CreateProjectInput {
  title: string
  subtitle?: string
  category?: string
  author?: string
  readOnly?: boolean
}

export type AppPage = 'list' | 'editor'
