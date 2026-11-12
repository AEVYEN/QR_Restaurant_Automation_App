// Masa modülünün PUBLIC API'si: diğer modüller ve app.js sadece bu dosyayı import eder.
import { PrismaTableRepository } from './infrastructure/table.repository.js';
import { ValidateTableUseCase } from './application/validate-table.use-case.js';
import { tableRoutes } from './presentation/table.routes.js';

export function createTableModule({ prisma }) {
  const tableRepository = new PrismaTableRepository({ prisma });
  const validateTableUseCase = new ValidateTableUseCase({ tableRepository });

  return {
    // app.js bunu register eder
    plugin: async (fastify) => fastify.register(tableRoutes, { validateTableUseCase }),
  };
}
