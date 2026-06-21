import type { GraphSnapshot } from '../types/graph'
import { DEFAULT_SNAPSHOT } from '../constants/defaults'

export const STORAGE_KEY = 'idea-execution-graph'
const SCHEMA_VERSION = 1

interface PersistedPayload {
  schemaVersion: number
  graph: GraphSnapshot
  ui: GraphSnapshot['ui']
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

    return {
      nodes: parsed.graph.nodes,
      edges: parsed.graph.edges,
      parkingLot: parsed.graph.parkingLot
        .map((item) => normalizeParkingLotItem(item))
        .filter((item): item is GraphSnapshot['parkingLot'][number] => item !== null),
      ui: {
        ...DEFAULT_SNAPSHOT.ui,
        ...parsed.ui,
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
      ui: snapshot.ui,
    },
    ui: snapshot.ui,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}
