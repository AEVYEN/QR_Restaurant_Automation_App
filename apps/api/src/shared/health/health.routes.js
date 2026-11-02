import ok from '../http/response.js';

export default async function healthRoutes(fastify) {
  fastify.get('/health', async () => {
    return ok({ status: 'ok' });
  });
}
