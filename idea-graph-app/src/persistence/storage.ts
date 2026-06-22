import type { GraphSnapshot } from '../types/graph'
import { DEFAULT_SNAPSHOT } from '../constants/defaults'

export const STORAGE_KEY = 'idea-execution-graph'
const SCHEMA_VERSION = 1

interface PersistedPayload {
  schemaVersion: number
  graph: GraphSnapshot
  ui: GraphSnapshot['ui']
}

function normalizeTask(task: unknown): GraphSnapshot['nodes'][number]['data']['tasks'][number] | null {
  if (!isObject(task) || typeof task.id !== 'string') {
    return null
  }

  const title = typeof task.title === 'string' ? task.title : ''
  const conclusion = typeof task.conclusion === 'string' ? task.conclusion : ''
  const category =
    typeof task.category === 'string'
      ? task.category
      : typeof task.required === 'string'
        ? task.required
        : ''

  return {
    id: task.id,
    title,
    category,
    conclusion,
    done: Boolean(task.done),
  }
}

function normalizeNode(node: GraphSnapshot['nodes'][number]): GraphSnapshot['nodes'][number] {
  const tasks = Array.isArray(node.data.tasks)
    ? node.data.tasks
        .map((task) => normalizeTask(task))
        .filter((task): task is NonNullable<ReturnType<typeof normalizeTask>> => task !== null)
    : []

  return {
    ...node,
    data: {
      ...node.data,
      tasks,
    },
  }
}

function normalizeParkingLotItem(value: unknown): GraphSnapshot['parkingLot'][number] | null {
  if (!isObject(value) || typeof value.id !== 'string') {
    return null
  }

  if (typeof value.content === 'string') {
    return { id: value.id, content: value.content }
  }

  const title = typeof value.title === 'string' ? value.title.trim() : ''
  const note = typeof value.note === 'string' ? value.note.trim() : ''
  const content = [title, note].filter(Boolean).join('\n\n')
  return { id: value.id, content }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function validatePayload(value: unknown): value is PersistedPayload {
  if (!isObject(value)) {
    return false
  }

  if (value.schemaVersion !== SCHEMA_VERSION) {
    return false
  }

  if (!isObject(value.graph) || !Array.isArray(value.graph.nodes) || !Array.isArray(value.graph.edges)) {
    return false
  }

  if (!Array.isArray(value.graph.parkingLot) || !isObject(value.graph.ui)) {
    return false
  }

  // ideaSpace is optional for backward compatibility
  return true
}

export function loadSnapshot(): GraphSnapshot {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return DEFAULT_SNAPSHOT
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!validatePayload(parsed)) {
      console.warn('Invalid or unsupported persisted payload. Reverting to default state.')
      return DEFAULT_SNAPSHOT
    }

    const ideaSpace = isObject(parsed.graph.ideaSpace)
      ? {
          ...DEFAULT_SNAPSHOT.ideaSpace,
          title: typeof parsed.graph.ideaSpace.title === 'string' ? parsed.graph.ideaSpace.title : '',
          subtitle: typeof parsed.graph.ideaSpace.subtitle === 'string' ? parsed.graph.ideaSpace.subtitle : '',
          targetDate: typeof parsed.graph.ideaSpace.targetDate === 'string' ? parsed.graph.ideaSpace.targetDate : '',
          category: typeof parsed.graph.ideaSpace.category === 'string' ? parsed.graph.ideaSpace.category : '',
          author: typeof parsed.graph.ideaSpace.author === 'string' ? parsed.graph.ideaSpace.author : '',
          readOnly: Boolean(parsed.graph.ideaSpace.readOnly),
          password: isObject(parsed.graph.ideaSpace.password) &&
            typeof parsed.graph.ideaSpace.password.salt === 'string' &&
            typeof parsed.graph.ideaSpace.password.hash === 'string'
            ? {
                salt: parsed.graph.ideaSpace.password.salt,
                hash: parsed.graph.ideaSpace.password.hash,
              }
            : null,
        }
      : DEFAULT_SNAPSHOT.ideaSpace

    return {
      nodes: parsed.graph.nodes.map((node) => normalizeNode(node)),
      edges: parsed.graph.edges,
      parkingLot: parsed.graph.parkingLot
        .map((item) => normalizeParkingLotItem(item))
        .filter((item): item is GraphSnapshot['parkingLot'][number] => item !== null),
      ideaSpace,
      ui: {
        ...DEFAULT_SNAPSHOT.ui,
        ...parsed.ui,
        addNodeDirection:
          typeof parsed.ui.addNodeDirection === 'string'
            ? parsed.ui.addNodeDirection
            : DEFAULT_SNAPSHOT.ui.addNodeDirection,
        displayFields: {
          ...DEFAULT_SNAPSHOT.ui.displayFields,
          ...parsed.ui.displayFields,
        },
      },
    }
  } catch {
    console.warn('Corrupted persisted payload. Reverting to default state.')
    return DEFAULT_SNAPSHOT
  }
}

export function saveSnapshot(snapshot: GraphSnapshot): void {
  const payload: PersistedPayload = {
    schemaVersion: SCHEMA_VERSION,
    graph: {
      nodes: snapshot.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          files: node.data.files.map((file) => ({
            id: file.id,
            name: file.name,
            url: file.url,
          })),
        },
      })),
      edges: snapshot.edges,
      parkingLot: snapshot.parkingLot,
      ideaSpace: snapshot.ideaSpace,
      ui: snapshot.ui,
    },
    ui: snapshot.ui,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}
