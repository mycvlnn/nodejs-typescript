import { Request, Response, NextFunction } from 'express'
import { HttpException } from './http-exception.js'

export function errorMiddleware(err: Error | HttpException, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpException) {
    return res.status(err.status).json({ status: 'error', message: err.message })
  }

  res.status(500).json({ status: 'error', message: 'Internal Server Error' })
}
