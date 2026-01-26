import { Request, Response, NextFunction } from 'express'
import { JWTUtils, TokenPayload } from '~/utils/jwt.js'
import { HttpException } from '~/core/http-exception.js'
import { TokenType } from '~/constants/enum.js'
import { HTTP_STATUS } from '~/constants/http-status.js'

// Extend Express Request type using module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload
  }
}

/**
 * Authentication Middleware
 * Verify JWT token và gán user data vào request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const decoded = JWTUtils.verifyToken(token)

    // Check if token is access token
    if (decoded.type !== TokenType.AccessToken) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: 'Invalid token type'
      })
    }

    // Attach user data to request
    req.user = decoded

    next()
  } catch (error) {
    next(error)
  }
}
