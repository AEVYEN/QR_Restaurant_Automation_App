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
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    try {
      app.log.info(`${signal} alındı, sunucu kapatılıyor`);
      await app.close();
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
}
