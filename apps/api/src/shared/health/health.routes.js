export default async function healthRoutes(fastify) {
  fastify.get('/health', async () => {
    return { data: { status: 'ok' } };
  });
}
