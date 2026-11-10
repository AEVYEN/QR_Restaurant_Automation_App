import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { config } from '../config/config.js';

// Prisma 7: veritabanına bağlanma işini "driver adapter" (pg) yapar
const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });

// Uygulamanın tamamı bu tek örneği kullanır
export const prisma = new PrismaClient({ adapter });

export async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}
