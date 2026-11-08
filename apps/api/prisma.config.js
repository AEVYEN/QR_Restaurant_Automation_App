import { defineConfig, env } from 'prisma/config';

// Tek .env dosyamız kök dizinde; yolu bu dosyanın konumuna göre bulunur
process.loadEnvFile(new URL('../../.env', import.meta.url));

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
