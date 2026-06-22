import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.route.js';
import { projectsRouter } from './routes/projects.route.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { logger } from './config/logger.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '5mb' }));
  app.use(pinoHttp({ logger }));

  // Routes
  const prefix = '/Idea-Execution-Graph/api';
  app.use(prefix, healthRouter);
  app.use(prefix, projectsRouter);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
