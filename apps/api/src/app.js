import Fastify from 'fastify';
import healthRoutes from './shared/health/health.routes.js';

export async function buildApp() {
  const app = Fastify({ logger: true });
  app.register(healthRoutes);
  return app;
}
