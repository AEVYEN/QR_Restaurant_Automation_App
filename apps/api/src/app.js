import Fastify from 'fastify';
import healthRoutes from './shared/health/health.routes.js';
import { config } from './shared/config/config.js';
import { errorHandler } from './shared/errors/error-handler.js';
import { NotFoundError } from './shared/errors/app-error.js';
import { prisma } from './shared/database/prisma.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: config.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
    },
  });
  app.setErrorHandler(errorHandler);

  app.setNotFoundHandler(async (request) => {
    throw new NotFoundError(`${request.method} ${request.url} bulunamadı`);
  });
  app.register(healthRoutes);
  // Sunucu kapanırken veritabanı bağlantı havuzunu da kapıtıyoruz
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
