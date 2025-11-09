export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = 'ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message, 'CONFLICT');
  }

  static unprocessable(message: string, details?: unknown) {
    return new ApiError(422, message, 'UNPROCESSABLE_ENTITY', details);
  }

  static internal(message = 'Internal Server Error', details?: unknown) {
    return new ApiError(500, message, 'INTERNAL_ERROR', details);
  }
}
