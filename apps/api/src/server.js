import { buildApp } from './app.js';
import { config } from './shared/config/config.js';

const app = await buildApp();
try {
  // Docker kullanıldığı için host değeri 0.0.0.0 atadım.
  await app.listen({ port: config.PORT, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
