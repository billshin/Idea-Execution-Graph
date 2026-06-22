import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
  logger.info(`Frontend URL: http://localhost:${env.PORT}/Idea-Execution-Graph/`);
  logger.info(`API prefix: /Idea-Execution-Graph/api`);
});
