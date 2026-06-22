import type { Request, Response, NextFunction } from 'express';
import { projectsService } from '../services/projects.service.js';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema.js';
import { ZodError } from 'zod';

function handleValidationError(res: Response, error: ZodError) {
  res.status(400).json({
    error: {
      message: 'Validation failed',
      details: error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    },
  });
}

function getRouteId(idParam: string | string[] | undefined): string {
  if (!idParam) {
    throw new Error('Missing project id');
  }
  return Array.isArray(idParam) ? idParam[0] : idParam;
}

export async function listProjects(_req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectsService.list();
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectsService.getById(getRouteId(req.params.id));
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) return handleValidationError(res, parsed.error);
    const project = await projectsService.create(parsed.data);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) return handleValidationError(res, parsed.error);
    const project = await projectsService.update(getRouteId(req.params.id), parsed.data);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    await projectsService.delete(getRouteId(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
