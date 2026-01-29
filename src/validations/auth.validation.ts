// src/validations/auth.validation.ts
import { checkSchema } from 'express-validator'
import { TOKEN_MESSAGES } from '~/constants/messages.js'
import { validate } from '~/utils/validate.js'
import { JWTUtils } from '~/utils/jwt.js'
import { HttpException } from '~/core/http-exception.js'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { Request } from 'express'

/**
 * Validator for Access Token (dùng trong protected routes)
 */
export const accessTokenValidator = validate(
  checkSchema(
    {
      authorization: {
        custom: {
          options: (value: string, { req }) => {
            // Check Bearer format
            if (!value || !value.startsWith('Bearer ')) {
              throw new HttpException({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: TOKEN_MESSAGES.INVALID_ACCESS_TOKEN
              })
            }

            // Extract token
            const token = value.substring(7)

            // Verify token
            const decoded = JWTUtils.verifyAccessToken(token)
            ;(req as Request).access_token_decoded = decoded // Gán user data vào request để sử dụng ở middleware tiếp theo
            return true
          }
        }
      }
    },
    ['headers'] // Chỉ validate headers
  )
)

export const refreshTokenValidator = validate(
  checkSchema({
    refresh_token: {
      in: ['body'],
      custom: {
        options: (value: string, { req }) => {
          // Trường hợp không gửi refresh_token lên
          if (!value?.trim()) {
            throw new HttpException({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: TOKEN_MESSAGES.REFRESH_TOKEN_REQUIRED
            })
          }

          // Verify token
          const decoded = JWTUtils.verifyRefreshToken(value)
          ;(req as Request).refresh_token_decoded = decoded
          return true
        }
      }
    }
  })
)
