import { Router } from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projects.controller.js';

export const projectsRouter = Router();

projectsRouter.get('/projects', listProjects);
projectsRouter.get('/projects/:id', getProject);
projectsRouter.post('/projects', createProject);
projectsRouter.put('/projects/:id', updateProject);
projectsRouter.delete('/projects/:id', deleteProject);
