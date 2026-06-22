import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  snapshotJson: z.string().min(1, 'Snapshot is required'),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  snapshotJson: z.string().min(1).optional(),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
