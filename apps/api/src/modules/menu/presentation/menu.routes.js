import ok from '../../../shared/http/response.js';
export async function menuRoutes(fastify, options) {
  const { getMenuUseCase } = options;
  fastify.get(
    '/menu',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    maxQuantityPerItem: { type: 'integer' },
                    products: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['isAvailable', 'price'],
                        properties: {
                          id: { type: 'integer' },
                          name: { type: 'string' },
                          description: { type: ['string', 'null'] },
                          price: { type: 'integer' },
                          imageUrl: { type: ['string', 'null'] },
                          isAvailable: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => {
      return ok(await getMenuUseCase.execute());
    },
  );
}
