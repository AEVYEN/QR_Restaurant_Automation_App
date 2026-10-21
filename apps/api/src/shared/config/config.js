import envSchema from 'env-schema';

const schema = {
  type: 'object',
  required: ['DATABASE_URL'],
  properties: {
    NODE_ENV: {
      type: 'string',
      enum: ['development', 'production', 'test'],
      default: 'development',
    },
    PORT: { type: 'integer', default: 3000 },
    LOG_LEVEL: {
      type: 'string',
      enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
      default: 'info',
    },
    DATABASE_URL: { type: 'string' },
    ORDER_EXPIRY_MINUTES: { type: 'integer', default: 15 },
  },
};

export const config = envSchema({ schema });
