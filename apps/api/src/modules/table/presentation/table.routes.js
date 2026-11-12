import ok from '../../../shared/http/response.js';

export async function tableRoutes(fastify, options) {
  const { validateTableUseCase } = options;

  fastify.get(
    '/tables/:number/validate',
    {
      schema: {
        // URL'deki :number parametresinin kuralı.
        // Kurala uymayan istek use case'e HİÇ ulaşmaz → otomatik 400 VALIDATION_ERROR.
        params: {
          type: 'object',
          required: ['number'],
          properties: {
            number: {
              type: 'integer',
              minimum: 0,
            },
          },
        },
        response: {
          200: {
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'object',
                required: ['number'],
                properties: {
                  number: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      return ok(await validateTableUseCase.execute(request.params.number));
    },
  );
}
