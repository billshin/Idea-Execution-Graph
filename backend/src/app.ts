import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.route.js';
import { projectsRouter } from './routes/projects.route.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { logger } from './config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBasePath = '/Idea-Execution-Graph';
const frontendPublicDir = path.resolve(__dirname, '../public');
const frontendIndexPath = path.join(frontendPublicDir, 'index.html');

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

  // Static frontend files copied from idea-graph-app build output.
  app.use(frontendBasePath, express.static(frontendPublicDir));
  app.get(`${frontendBasePath}/*splat`, (_req, res) => {
    res.sendFile(frontendIndexPath);
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
