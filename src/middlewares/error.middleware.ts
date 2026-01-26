import { Request, Response, NextFunction } from 'express'
import omit from 'lodash/omit.js'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { EntityError, HttpException } from '~/core/http-exception.js'

/**
 * Global Error Handler Middleware
 * Xử lý tất cả errors trong app
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (error: Error | HttpException, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpException || error instanceof EntityError) {
    return res.status(error.status).json(omit(error, 'status'))
  }

  // Xử lý MongoDB errors
  if (error.name === 'MongoServerError') {
    const mongoError = error as any

    // Duplicate key error
    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyPattern || {})[0]
      return res.status(409).json({
        status: 'error',
        message: `${field} already exists`
      })
    }

    // Validation error
    if (mongoError.code === 121) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed: ' + mongoError.message
      })
    }
  }

  // Xử lý validation errors khác
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: error.message
    })
  }

  // Default error response
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: error.message || 'Internal server error'
  })
}
