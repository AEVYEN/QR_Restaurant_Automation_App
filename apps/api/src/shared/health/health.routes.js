import ok from '../http/response.js';

export default async function healthRoutes(fastify) {
  fastify.get(
    '/health',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => {
      return ok({ status: 'ok' });
    },
  );
}
