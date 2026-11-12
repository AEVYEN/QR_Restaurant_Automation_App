import Fastify from 'fastify';
import healthRoutes from './shared/health/health.routes.js';
import { errorHandler } from './shared/errors/error-handler.js';
import { NotFoundError } from './shared/errors/app-error.js';
import { identityModule } from './modules/identity/index.js';
import { orderingModule } from './modules/ordering/index.js';

export async function buildApp(container) {
  const { config, prisma, checkDatabase, menu, table } = container;

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
      api.register(menu.plugin);
      api.register(table.plugin);
      api.register(orderingModule);
      api.register(identityModule);
    },
    { prefix: '/api/v1' }, //Mobil sürümle web sürümü karmaşasının önüne geçer.
  );

  // Sunucu kapanırken veritabanı bağlantı havuzunu da kapatıyoruz
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
