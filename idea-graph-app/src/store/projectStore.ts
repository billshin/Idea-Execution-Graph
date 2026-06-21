import { create } from 'zustand'
import { DEFAULT_SNAPSHOT } from '../constants/defaults'
import { saveProjects, loadProjects } from '../persistence/projectStorage'
import type { AppPage, GraphSnapshot, IdeaProject } from '../types/graph'

interface ProjectState {
  projects: IdeaProject[]
  currentProjectId: string | null
  currentPage: AppPage
  
  // Project management
  createProject: (title: string, subtitle?: string) => string
  deleteProject: (projectId: string) => void
  updateProjectMetadata: (projectId: string, title: string, subtitle: string) => void
  
  // Navigation
  goToList: () => void
  goToEditor: (projectId: string) => void
  
  // Project data
  getCurrentProject: () => IdeaProject | null
  updateProjectSnapshot: (projectId: string, snapshot: GraphSnapshot) => void
  loadProjects: (projects: IdeaProject[]) => void
  initializeProjects: () => void
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function nowIso(): string {
  return new Date().toISOString()
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: loadProjects(),
  currentProjectId: null,
  currentPage: 'list',

  createProject: (title, subtitle = '') => {
    const id = createId('project')
    const now = nowIso()
    
    const newProject: IdeaProject = {
      id,
      title,
      subtitle,
      createdAt: now,
      updatedAt: now,
      snapshot: structuredClone(DEFAULT_SNAPSHOT),
    }

    set((state) => {
      const newProjects = [...state.projects, newProject]
      saveProjects(newProjects)
      return {
        projects: newProjects,
        currentProjectId: id,
        currentPage: 'editor',
      }
    })

    return id
  },

  deleteProject: (projectId) => {
    set((state) => {
      const newProjects = state.projects.filter((p) => p.id !== projectId)
      saveProjects(newProjects)
      return {
        projects: newProjects,
        currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId,
        currentPage: state.currentProjectId === projectId ? 'list' : state.currentPage,
      }
    })
  },

  updateProjectMetadata: (projectId, title, subtitle) => {
    set((state) => {
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, title, subtitle, updatedAt: nowIso() }
          : p,
      )
      saveProjects(newProjects)
      return { projects: newProjects }
    })
  },

  goToList: () => {
    set({ currentPage: 'list' })
  },

  goToEditor: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId)
    if (project) {
      set({ currentProjectId: projectId, currentPage: 'editor' })
    }
  },

  getCurrentProject: () => {
    const { projects, currentProjectId } = get()
    if (!currentProjectId) return null
    return projects.find((p) => p.id === currentProjectId) || null
  },

  updateProjectSnapshot: (projectId, snapshot) => {
    set((state) => {
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, snapshot, updatedAt: nowIso() }
          : p,
      )
      saveProjects(newProjects)
      return { projects: newProjects }
    })
  },

  loadProjects: (projects) => {
    set({ projects })
    saveProjects(projects)
  },

  initializeProjects: () => {
    const projects = loadProjects()
    set({ projects })
  },
}))
