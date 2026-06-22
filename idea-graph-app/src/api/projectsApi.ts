const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/Idea-Execution-Graph/api`;

interface ProjectResponse {
  id: string;
  title: string;
  subtitle: string | null;
  snapshotJson: string;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body as any)?.error?.message || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as T;
}

export const projectsApi = {
  listProjects() {
    return request<ProjectResponse[]>('/projects');
  },

  getProject(id: string) {
    return request<ProjectResponse>(`/projects/${encodeURIComponent(id)}`);
  },

  createProject(data: { title: string; subtitle?: string; snapshotJson: string }) {
    return request<ProjectResponse>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProject(id: string, data: { title?: string; subtitle?: string; snapshotJson?: string }) {
    return request<ProjectResponse>(`/projects/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProject(id: string) {
    return request<void>(`/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
