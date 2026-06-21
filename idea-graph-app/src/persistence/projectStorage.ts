import type { IdeaProject } from '../types/graph'

const PROJECTS_STORAGE_KEY = 'idea-graph-projects'

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
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (error) {
    console.error('Failed to load projects:', error)
    return []
  }
}
