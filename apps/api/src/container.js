import { config } from './shared/config/config.js';
import { prisma, checkDatabase } from './shared/database/prisma.js';

// Uygulamanın tüm bağımlılıkları burada toplanıyor.
// Modüller eklendikçe repository → use case zinciri de burada kurulacak.
export function buildContainer() {
  return {
    config,
    prisma,
    checkDatabase,
  };
}
