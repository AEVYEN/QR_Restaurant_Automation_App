/**
 * Fastify'ın (Ajv) ham doğrulama hatalarını istemciye uygun sade bir listeye çevirir.
 *
 * Girdi (error.validation) örnekleri:
 *   { instancePath: '/name', keyword: 'minLength', params: { limit: 2 },
 *     message: 'must NOT have fewer than 2 characters', schemaPath: '...' }
 *   { instancePath: '', keyword: 'required', params: { missingProperty: 'name' },
 *     message: "must have required property 'name'", schemaPath: '...' }
 *
 * Çıktı: [{ field: 'name', message: '...' }]
 *
 * @param {Array<object>} validation - error.validation dizisi
 * @returns {Array<{ field: string, message: string }>}
 */
export function formatValidationErrors(validation) {
  return validation.map((err) => ({
    field: err.keyword === 'required' ? err.params.missingProperty : err.instancePath.slice(1),
    message: err.message,
  }));
}
