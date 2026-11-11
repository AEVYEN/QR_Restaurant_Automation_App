import { existsSync } from 'node:fs';
import { defineConfig, env } from 'prisma/config';

// Yerelde kökteki .env'i yükle; Docker'da dosya yoktur, değişkenler ortamdan gelir
const envFile = new URL('../../.env', import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node --env-file-if-exists=../../.env prisma/seed.js',
  },
  datasource: { url: env('DATABASE_URL') },
});
