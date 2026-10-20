import { buildApp } from './app.js';

const app = await buildApp();
try {
  // Docker kullanıldığı için host değeri 0.0.0.0'dır.
  await app.listen({ port: 3000, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
