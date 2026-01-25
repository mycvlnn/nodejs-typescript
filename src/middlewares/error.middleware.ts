import { Request, Response, NextFunction } from 'express'
import { HttpException } from '~/core/http-exception.js'

/**
 * Global Error Handler Middleware
 * Xử lý tất cả errors trong app
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (error: Error | HttpException, req: Request, res: Response, _next: NextFunction) => {
  // Log error để debug
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  })

  // Nếu là HttpException (custom error)
  if (error instanceof HttpException) {
    return res.status(error.status).json({
      status: 'error',
      statusCode: error.status,
      message: error.message
    })
  }

  // Xử lý MongoDB errors
  if (error.name === 'MongoServerError') {
    const mongoError = error as any

    // Duplicate key error
    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyPattern || {})[0]
      return res.status(409).json({
        status: 'error',
        statusCode: 409,
        message: `${field} already exists`
      })
    }

    // Validation error
    if (mongoError.code === 121) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed: ' + mongoError.message
      })
    }
  }

  // Xử lý validation errors khác
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message
    })
  }

  // Default error response
  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: error.message || 'Internal server error'
  })
}
