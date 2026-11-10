import Fastify from 'fastify';
import healthRoutes from './shared/health/health.routes.js';
import { errorHandler } from './shared/errors/error-handler.js';
import { NotFoundError } from './shared/errors/app-error.js';
import { menuModule } from './modules/menu/index.js';
import { identityModule } from './modules/identity/index.js';
import { orderingModule } from './modules/ordering/index.js';
import { tableModule } from './modules/table/index.js';

export async function buildApp(container) {
  const { config, prisma, checkDatabase } = container;

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
  app.register(healthRoutes, { checkDatabase });
  app.register(
    async (api) => {
      api.register(menuModule);
      api.register(tableModule);
      api.register(orderingModule);
      api.register(identityModule);
    },
    { prefix: '/api/v1' },
  );

  // Sunucu kapanırken veritabanı bağlantı havuzunu da kapatıyoruz
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
