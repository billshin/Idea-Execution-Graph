import { create } from 'zustand'
import { DEFAULT_SNAPSHOT } from '../constants/defaults'
import { saveProjects, loadProjects } from '../persistence/projectStorage'
import type { AppPage, CreateProjectInput, GraphSnapshot, IdeaProject, ProjectAccessMode } from '../types/graph'

interface ProjectState {
  projects: IdeaProject[]
  currentProjectId: string | null
  currentPage: AppPage
  accessModesByProjectId: Record<string, ProjectAccessMode>
  
  // Project management
  createProject: (input: CreateProjectInput) => Promise<string>
  deleteProject: (projectId: string) => void
  updateProjectMetadata: (projectId: string, title: string, subtitle: string) => void
  
  // Navigation
  goToList: () => void
  goToEditor: (projectId: string) => void
  
  // Project data
  getCurrentProject: () => IdeaProject | null
  getProjectAccessMode: (projectId: string) => ProjectAccessMode | null
  setProjectAccessMode: (projectId: string, mode: ProjectAccessMode) => void
  clearProjectAccessMode: (projectId: string) => void
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
  accessModesByProjectId: {},

  createProject: async ({ title, subtitle = '', category = '', author = '', readOnly = false }) => {
    const id = createId('project')
    const now = nowIso()
    const trimmedTitle = title.trim()
    const trimmedSubtitle = subtitle.trim()
    const trimmedCategory = category.trim()
    const trimmedAuthor = author.trim()
    const initialSnapshot = structuredClone(DEFAULT_SNAPSHOT)

    initialSnapshot.ideaSpace = {
      ...initialSnapshot.ideaSpace,
      title: trimmedTitle,
      subtitle: trimmedSubtitle,
      category: trimmedCategory,
      author: trimmedAuthor,
      readOnly,
    }
    
    const newProject: IdeaProject = {
      id,
      title: trimmedTitle,
      subtitle: trimmedSubtitle,
      createdAt: now,
      updatedAt: now,
      snapshot: initialSnapshot,
    }

    set((state) => {
      const newProjects = [...state.projects, newProject]
      saveProjects(newProjects)
      return {
        projects: newProjects,
        currentProjectId: id,
        currentPage: 'editor',
        accessModesByProjectId: {
          ...state.accessModesByProjectId,
          [id]: readOnly ? 'read-only' : 'edit',
        },
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
        accessModesByProjectId: Object.fromEntries(
          Object.entries(state.accessModesByProjectId).filter(([id]) => id !== projectId),
        ),
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

  getProjectAccessMode: (projectId) => get().accessModesByProjectId[projectId] ?? null,

  setProjectAccessMode: (projectId, mode) => {
    set((state) => ({
      accessModesByProjectId: {
        ...state.accessModesByProjectId,
        [projectId]: mode,
      },
    }))
  },

  clearProjectAccessMode: (projectId) => {
    set((state) => ({
      accessModesByProjectId: Object.fromEntries(
        Object.entries(state.accessModesByProjectId).filter(([id]) => id !== projectId),
      ),
    }))
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
