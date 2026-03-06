import { checkSchema } from 'express-validator'
import { TOKEN_MESSAGES } from '~/constants/messages.js'
import { validate } from '~/utils/validate.js'
import { JWTUtils } from '~/utils/jwt.js'
import { HttpException } from '~/core/http-exception.js'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { Request } from 'express'
import { emailSchema, passwordConfirmSchema, passwordSchema } from './common.validation.js'

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

export const resendEmailVerifyValidator = validate(
  checkSchema({
    email: emailSchema
  })
)

export const forgotPasswordValidator = validate(
  checkSchema({
    email: emailSchema
  })
)

export const resetPasswordValidator = validate(
  checkSchema({
    forgot_password_token: {
      in: ['body'],
      custom: {
        options: (value: string, { req }) => {
          if (!value?.trim()) {
            throw new HttpException({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: TOKEN_MESSAGES.FORGOT_PASSWORD_TOKEN_REQUIRED
            })
          }
          const decoded = JWTUtils.verifyForgotPasswordToken(value)
          ;(req as Request).forgot_password_token_decoded = decoded
          return true
        }
      }
    },
    new_password: passwordSchema,
    confirm_new_password: passwordConfirmSchema
  })
)

export const verifyEmailValidator = validate(
  checkSchema({
    email_verify_token: {
      in: ['body'],
      custom: {
        options: (value: string, { req }) => {
          // Trường hợp không gửi  email_verify_token lên -> lỗi
          if (!value?.trim()) {
            throw new HttpException({
              status: HTTP_STATUS.UNAUTHORIZED,
              message: TOKEN_MESSAGES.EMAIL_VERIFY_TOKEN_REQUIRED
            })
          }

          // Verify token
          const decoded = JWTUtils.verifyEmailVerifyToken(value)
          ;(req as Request).email_verify_token_decoded = decoded
          return true
        }
      }
    }
  })
)
