export class AppError extends Error {
  constructor(message, statusCode, code, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Kaynak bulunamadı', details) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Geçersiz kullanıcı verisi', details) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Servis şu anda erişilemiyor', details) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}
