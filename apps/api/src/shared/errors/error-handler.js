import { AppError } from './app-error.js';
import { formatValidationErrors } from './format-validation-errors.js';

export function errorHandler(error, request, reply) {
  // AppError throw errors
  if (error instanceof AppError) {
    const { statusCode, code, message, details } = error;
    return reply.status(statusCode).send({ error: { code, message, details } });
  }

  // Schema validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Geçersiz/Hatalı kullanıcı verisi',
        details: formatValidationErrors(error.validation),
      },
    });
  }

  // Fastify'ın kendi istemci hataları (bozuk JSON, desteklenmeyen format...)
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return reply
      .status(error.statusCode)
      .send({ error: { code: error.code, message: error.message } });
  }

  request.log.error(error);
  return reply
    .status(500)
    .send({ error: { code: 'INTERNAL_ERROR', message: 'Beklenmedik bir hata' } });
}
