export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404)
  }
}

export class ValidationError extends AppError {
  public readonly errors: unknown
  constructor(message = 'Validation failed', errors?: unknown) {
    super(message, 400)
    this.errors = errors
  }
}
