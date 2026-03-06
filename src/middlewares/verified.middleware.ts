import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { AUTH_MESSAGES } from '~/constants/messages.js'
import { HttpException } from '~/core/http-exception.js'
import { UserModel } from '~/models/user.model.js'
import { UserStatus } from '~/types/user.types.js'

/**
 * Middleware kiểm tra user đã verify email chưa
 * Dùng sau accessTokenValidator (cần access_token_decoded)
 */
export const verifiedEmailMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const userId = req.access_token_decoded?.userId

    if (!userId) {
      return next(
        new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: AUTH_MESSAGES.USER_NOT_FOUND
        })
      )
    }

    const user = await UserModel.findById(userId)

    if (!user) {
      return next(
        new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: AUTH_MESSAGES.USER_NOT_FOUND
        })
      )
    }

    if (user.status !== UserStatus.Verified) {
      return next(
        new HttpException({
          status: HTTP_STATUS.FORBIDDEN,
          message: AUTH_MESSAGES.EMAIL_NOT_VERIFIED
        })
      )
    }

    return next()
  } catch (error) {
    return next(error)
  }
}
