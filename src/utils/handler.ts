import { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wrapper function tự động xử lý try-catch cho async handlers
 * Không cần viết try-catch lặp lại trong mỗi controller
 */
export const wrapRequestHandler = (fn: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
