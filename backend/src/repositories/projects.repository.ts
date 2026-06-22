import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export const projectsRepository = {
  async findAll() {
    return prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.project.findUnique({ where: { id } });
  },

  async create(data: CreateProjectInput) {
    return prisma.project.create({ data });
  },

  async update(id: string, data: UpdateProjectInput) {
    return prisma.project.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },
};
