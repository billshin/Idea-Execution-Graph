import { DEFAULT_SNAPSHOT } from '../constants/defaults'
import type { GraphSnapshot, IdeaProject, PasswordHashValue } from '../types/graph'

const PROJECTS_STORAGE_KEY = 'idea-graph-projects'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizePasswordHashValue(value: unknown): PasswordHashValue | null {
  if (!isObject(value) || typeof value.salt !== 'string' || typeof value.hash !== 'string') {
    return null
  }

  return {
    salt: value.salt,
    hash: value.hash,
  }
}

function normalizeSnapshot(snapshot: GraphSnapshot | unknown): GraphSnapshot {
  if (!isObject(snapshot) || !isObject(snapshot.ideaSpace)) {
    return structuredClone(DEFAULT_SNAPSHOT)
  }

  const ideaSpace = snapshot.ideaSpace
  const snapshotValue = snapshot as Record<string, unknown>

  return {
    ...structuredClone(DEFAULT_SNAPSHOT),
    ...(snapshotValue as Partial<GraphSnapshot>),
    ideaSpace: {
      ...DEFAULT_SNAPSHOT.ideaSpace,
      title: typeof ideaSpace.title === 'string' ? ideaSpace.title : '',
      subtitle: typeof ideaSpace.subtitle === 'string' ? ideaSpace.subtitle : '',
      targetDate: typeof ideaSpace.targetDate === 'string' ? ideaSpace.targetDate : '',
      category: typeof ideaSpace.category === 'string' ? ideaSpace.category : '',
      author: typeof ideaSpace.author === 'string' ? ideaSpace.author : '',
      readOnly: Boolean(ideaSpace.readOnly),
      password: normalizePasswordHashValue(ideaSpace.password),
    },
  }
}

function normalizeProject(project: unknown): IdeaProject | null {
  if (!isObject(project) || typeof project.id !== 'string') {
    return null
  }

  return {
    id: project.id,
    title: typeof project.title === 'string' ? project.title : '',
    subtitle: typeof project.subtitle === 'string' ? project.subtitle : '',
    createdAt: typeof project.createdAt === 'string' ? project.createdAt : new Date().toISOString(),
    updatedAt: typeof project.updatedAt === 'string' ? project.updatedAt : new Date().toISOString(),
    snapshot: normalizeSnapshot(project.snapshot),
  }
}

export function saveProjects(projects: IdeaProject[]): void {
  try {
    const serialized = JSON.stringify(projects)
    localStorage.setItem(PROJECTS_STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save projects:', error)
  }
}

export function loadProjects(): IdeaProject[] {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((project) => normalizeProject(project))
      .filter((project): project is IdeaProject => project !== null)
  } catch (error) {
    console.error('Failed to load projects:', error)
    return []
  }
}
