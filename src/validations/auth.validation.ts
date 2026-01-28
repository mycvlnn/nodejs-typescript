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
            console.log('Validating Access Token:', value)

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

/**
 * Validator for Refresh Token
 */
export const refreshTokenValidator = validate(
  checkSchema({
    refresh_token: {
      in: ['body'],
      notEmpty: {
        errorMessage: TOKEN_MESSAGES.REFRESH_TOKEN_REQUIRED
      },
      custom: {
        options: async (value: string, { req }) => {
          // Verify token
          const decoded = JWTUtils.verifyRefreshToken(value)
          ;(req as Request).refresh_token_decoded = decoded // Gán user data vào request để sử dụng ở middleware tiếp theo

          // Thực hiện kiểm tra xem userId của access token và refresh token có khớp nhau không
          const accessTokenDecoded = (req as Request).access_token_decoded
          if (accessTokenDecoded?.userId !== decoded?.userId) {
            throw new HttpException({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: TOKEN_MESSAGES.REFRESH_TOKEN_USER_MISMATCH
            })
          }

          return true
        }
      }
    }
  })
)
