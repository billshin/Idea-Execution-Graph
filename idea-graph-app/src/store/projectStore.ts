import { create } from 'zustand'
import { DEFAULT_SNAPSHOT } from '../constants/defaults'
import { saveProjects, loadProjects } from '../persistence/projectStorage'
import { projectsApi } from '../api/projectsApi'
import type { AppPage, CreateProjectInput, GraphSnapshot, IdeaProject, ProjectAccessMode } from '../types/graph'

export type DataSourceMode = 'local' | 'api'

interface ProjectState {
  projects: IdeaProject[]
  currentProjectId: string | null
  currentPage: AppPage
  accessModesByProjectId: Record<string, ProjectAccessMode>
  dataSourceMode: DataSourceMode
  
  // Project management
  createProject: (input: CreateProjectInput) => Promise<string>
  deleteProject: (projectId: string) => Promise<void>
  updateProjectMetadata: (projectId: string, title: string, subtitle: string) => void
  setDataSourceMode: (mode: DataSourceMode) => void
  
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
  initializeProjects: () => Promise<void>
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function nowIso(): string {
  return new Date().toISOString()
}

// Debounced API save for auto-save in API mode
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()
function debouncedApiSave(projectId: string, snapshot: GraphSnapshot) {
  const existing = saveTimers.get(projectId)
  if (existing) clearTimeout(existing)
  const timer = setTimeout(async () => {
    saveTimers.delete(projectId)
    try {
      await projectsApi.updateProject(projectId, {
        snapshotJson: JSON.stringify(snapshot),
      })
    } catch (err) {
      console.error('[API save failed]', err)
    }
  }, 800)
  saveTimers.set(projectId, timer)
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: loadProjects(),
  currentProjectId: null,
  currentPage: 'list',
  accessModesByProjectId: {},
  dataSourceMode: (localStorage.getItem('dataSourceMode') as DataSourceMode) || 'local',

  createProject: async ({ title, subtitle = '', category = '', author = '', readOnly = false }) => {
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

    const mode = get().dataSourceMode

    if (mode === 'api') {
      const created = await projectsApi.createProject({
        title: trimmedTitle,
        subtitle: trimmedSubtitle,
        snapshotJson: JSON.stringify(initialSnapshot),
      })
      const newProject: IdeaProject = {
        id: created.id,
        title: created.title,
        subtitle: created.subtitle || '',
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        snapshot: JSON.parse(created.snapshotJson),
      }
      set((state) => ({
        projects: [...state.projects, newProject],
        currentProjectId: created.id,
        currentPage: 'editor',
        accessModesByProjectId: {
          ...state.accessModesByProjectId,
          [created.id]: readOnly ? 'read-only' : 'edit',
        },
      }))
      return created.id
    }

    const id = createId('project')
    const now = nowIso()
    
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

  deleteProject: async (projectId) => {
    const mode = get().dataSourceMode
    if (mode === 'api') {
      await projectsApi.deleteProject(projectId)
    }
    set((state) => {
      const newProjects = state.projects.filter((p) => p.id !== projectId)
      if (mode === 'local') saveProjects(newProjects)
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
      if (state.dataSourceMode === 'local') {
        saveProjects(newProjects)
      } else {
        debouncedApiSave(projectId, snapshot)
      }
      return { projects: newProjects }
    })
  },

  loadProjects: (projects) => {
    set({ projects })
    saveProjects(projects)
  },

  initializeProjects: async () => {
    const mode = get().dataSourceMode
    if (mode === 'api') {
      const apiProjects = await projectsApi.listProjects()
      const projects: IdeaProject[] = apiProjects.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle || '',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        snapshot: JSON.parse(p.snapshotJson),
      }))
      set({ projects })
    } else {
      const projects = loadProjects()
      set({ projects })
    }
  },

  setDataSourceMode: (mode) => {
    localStorage.setItem('dataSourceMode', mode)
    set({ dataSourceMode: mode })
  },
}))
