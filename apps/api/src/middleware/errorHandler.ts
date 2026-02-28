import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================
export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================
export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
        status: 400,
      },
    })
    return
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        status: err.status,
      },
    })
    return
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        status: 401,
      },
    })
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        status: 401,
      },
    })
    return
  }

  // Handle Prisma errors (if using Prisma)
  if ((err as any).code?.startsWith('P')) {
    const prismaError = err as any
    let message = 'Database error'
    let status = 500

    switch (prismaError.code) {
      case 'P2002':
        message = 'A record with this value already exists'
        status = 409
        break
      case 'P2025':
        message = 'Record not found'
        status = 404
        break
      case 'P2003':
        message = 'Related record not found'
        status = 404
        break
    }

    res.status(status).json({
      error: {
        message,
        code: 'DATABASE_ERROR',
        status,
      },
    })
    return
  }

  // Default error response
  const status = 500
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Something went wrong'

  res.status(status).json({
    error: {
      message,
      code: 'INTERNAL_ERROR',
      status,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  })
}

// ============================================================================
// ASYNC ERROR WRAPPER
// ============================================================================
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
