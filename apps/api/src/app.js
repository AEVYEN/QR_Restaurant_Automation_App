import Fastify from 'fastify';
import healthRoutes from './shared/health/health.routes.js';
import { config } from './shared/config/config.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: config.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
    },
  });
  app.register(healthRoutes);
  return app;
}
