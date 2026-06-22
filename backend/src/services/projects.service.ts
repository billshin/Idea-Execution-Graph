import { projectsRepository } from '../repositories/projects.repository.js';
import type { CreateProjectDto, UpdateProjectDto } from '../schemas/project.schema.js';

export const projectsService = {
  async list() {
    return projectsRepository.findAll();
  },

  async getById(id: string) {
    const project = await projectsRepository.findById(id);
    if (!project) {
      const err = new Error('Project not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }
    return project;
  },

  async create(data: CreateProjectDto) {
    return projectsRepository.create(data);
  },

  async update(id: string, data: UpdateProjectDto) {
    // Ensure project exists
    await this.getById(id);
    return projectsRepository.update(id, data);
  },

  async delete(id: string) {
    // Ensure project exists
    await this.getById(id);
    return projectsRepository.delete(id);
  },
};
