export class AppError extends Error {
  constructor(message, status = 500, code = 'APP_ERROR', details = undefined) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.statusCode = status;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}

export function createHttpError(message, status = 400, code = 'BAD_REQUEST', details = undefined) {
  return new AppError(message, status, code, details);
}

export const badRequest = (message, code = 'BAD_REQUEST', details) =>
  createHttpError(message, 400, code, details);

export const unauthorized = (message = 'Unauthorized', code = 'UNAUTHORIZED') =>
  createHttpError(message, 401, code);

export const forbidden = (message = 'Forbidden', code = 'FORBIDDEN') =>
  createHttpError(message, 403, code);

export const notFound = (message = 'Not found', code = 'NOT_FOUND') =>
  createHttpError(message, 404, code);

export const conflict = (message, code = 'CONFLICT', details) =>
  createHttpError(message, 409, code, details);
