import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface CreateProjectInput {
  title: string;
  subtitle?: string;
  snapshotJson: string;
}

export interface UpdateProjectInput {
  title?: string;
  subtitle?: string;
  snapshotJson?: string;
}

export interface StoredProject {
  id: string;
  title: string;
  subtitle: string | null;
  snapshotJson: string;
  createdAt: string;
  updatedAt: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const projectsFile = path.join(dataDir, 'projects.json');

async function readProjects(): Promise<StoredProject[]> {
  try {
    const raw = await readFile(projectsFile, 'utf8');
    const parsed = JSON.parse(raw) as StoredProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeProjects(projects: StoredProject[]): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(projectsFile, JSON.stringify(projects, null, 2), 'utf8');
}

export const projectsRepository = {
  async findAll() {
    const projects = await readProjects();
    return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async findById(id: string) {
    const projects = await readProjects();
    return projects.find((project) => project.id === id) ?? null;
  },

  async create(data: CreateProjectInput) {
    const projects = await readProjects();
    const now = new Date().toISOString();
    const project: StoredProject = {
      id: randomUUID(),
      title: data.title,
      subtitle: data.subtitle ?? null,
      snapshotJson: data.snapshotJson,
      createdAt: now,
      updatedAt: now,
    };
    projects.push(project);
    await writeProjects(projects);
    return project;
  },

  async update(id: string, data: UpdateProjectInput) {
    const projects = await readProjects();
    const index = projects.findIndex((project) => project.id === id);
    if (index === -1) {
      return null;
    }

    const current = projects[index];
    const updated: StoredProject = {
      ...current,
      ...data,
      subtitle: data.subtitle !== undefined ? data.subtitle : current.subtitle,
      updatedAt: new Date().toISOString(),
    };

    projects[index] = updated;
    await writeProjects(projects);
    return updated;
  },

  async delete(id: string) {
    const projects = await readProjects();
    const index = projects.findIndex((project) => project.id === id);
    if (index === -1) {
      return null;
    }

    const [deleted] = projects.splice(index, 1);
    await writeProjects(projects);
    return deleted;
  },
};
