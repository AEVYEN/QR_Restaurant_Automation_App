// Menü modülünün PUBLIC API'si: diğer modüller ve app.js sadece bu dosyayı import eder.
import { PrismaMenuRepository } from './infrastructure/menu.repository.js';
import { GetMenuUseCase } from './application/get-menu.use-case.js';
import { menuRoutes } from './presentation/menu.routes.js';

export function createMenuModule({ prisma }) {
  const menuRepository = new PrismaMenuRepository({ prisma });
  const getMenuUseCase = new GetMenuUseCase({ menuRepository });

  return {
    // app.js bunu register eder
    plugin: async (fastify) => fastify.register(menuRoutes, { getMenuUseCase }),
  };
}
