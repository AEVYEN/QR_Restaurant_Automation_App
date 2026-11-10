import { checkDatabase } from '../database/prisma.js';
import ok from '../http/response.js';
import { ServiceUnavailableError } from '../errors/app-error.js';
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
                  database: { type: 'string' },
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
    async (request) => {
      try {
        await checkDatabase();
      } catch (err) {
        request.log.error(err);
        throw new ServiceUnavailableError();
      }
      return ok({ status: 'ok', database: 'up' });
    },
  );
}
