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
            // TODO (SEN): number için tip ve alt sınır yaz.
            //   - Tam sayı olmalı
            //   - Table entity'si ile AYNI kural: 0 dahil (bar masası)
            number: { ___ },
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
      // TODO (SEN): URL'deki numarayı al, use case'e ver, sonucu ok(...) ile sarıp döndür.
      //   İpucu: URL parametreleri request.params içinde durur.
    },
  );
}
