import jwt from 'jsonwebtoken'
import { envConfig } from '~/config/env-config.js'
import { TokenType } from '~/constants/enum.js'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { TOKEN_MESSAGES } from '~/constants/messages.js'
import { HttpException } from '~/core/http-exception.js'
import {
  DecodedToken,
  EmailVerifyTokenPayload,
  ForgotPasswordTokenPayload,
  SignAccessTokenParams,
  SignRefreshTokenParams,
  SignTokenParams,
  TokenPayload
} from '~/types/jwt.types.js'

export class JWTUtils {
  private static signToken({ payload, expiresIn, secretOrPrivateKey }: SignTokenParams): string {
    return jwt.sign(payload, secretOrPrivateKey, { expiresIn })
  }

  static generateEmailVerifyToken(payload: EmailVerifyTokenPayload): string {
    return this.signToken({
      payload: {
        email: payload.email,
        userId: payload.userId
      },
      secretOrPrivateKey: envConfig.jwtEmailVerificationTokenSecret,
      expiresIn: envConfig.jwtEmailVerificationTokenExpiresIn
    })
  }

  static generateForgotPasswordToken(payload: ForgotPasswordTokenPayload): string {
    return this.signToken({
      payload: {
        email: payload.email,
        userId: payload.userId
      },
      secretOrPrivateKey: envConfig.jwtForgotPasswordTokenSecret,
      expiresIn: envConfig.jwtForgotPasswordTokenExpiresIn
    })
  }

  static verifyForgotPasswordToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, envConfig.jwtForgotPasswordTokenSecret) as DecodedToken
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.FORGOT_PASSWORD_TOKEN_EXPIRED
        })
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN
        })
      }
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: TOKEN_MESSAGES.FORGOT_PASSWORD_TOKEN_VERIFICATION_FAILED
      })
    }
  }

  static verifyEmailVerifyToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, envConfig.jwtEmailVerificationTokenSecret) as DecodedToken
      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.EMAIL_VERIFY_TOKEN_EXPIRED
        })
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.INVALID_EMAIL_VERIFY_TOKEN
        })
      }

      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: TOKEN_MESSAGES.EMAIL_VERIFY_TOKEN_VERIFICATION_FAILED
      })
    }
  }

  /**
   * Generate Access Token
   */
  static generateAccessToken({
    payload,
    expiresIn = envConfig.jwtAccessTokenExpiresIn
  }: SignAccessTokenParams): string {
    return this.signToken({
      payload: {
        ...payload,
        type: TokenType.AccessToken
      },
      secretOrPrivateKey: envConfig.jwtAccessTokenSecret,
      expiresIn
    })
  }

  /**
   * Generate Refresh Token
   */
  static generateRefreshToken({
    payload,
    expiresIn = envConfig.jwtRefreshTokenExpiresIn
  }: SignRefreshTokenParams): string {
    return this.signToken({
      payload: {
        ...payload,
        type: TokenType.RefreshToken
      },
      secretOrPrivateKey: envConfig.jwtRefreshTokenSecret,
      expiresIn
    })
  }

  /**
   * Generate both tokens
   */
  static generateTokens({ email, userId }: Omit<TokenPayload, 'type'>): {
    accessToken: string
    refreshToken: string
  } {
    return {
      accessToken: this.generateAccessToken({
        payload: {
          email,
          userId
        }
      }),
      refreshToken: this.generateRefreshToken({
        payload: {
          email,
          userId
        }
      })
    }
  }

  /**
   * Verify Access Token
   * ✅ Specific error messages cho access token
   */
  static verifyAccessToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, envConfig.jwtAccessTokenSecret) as DecodedToken

      // Check token type
      if (decoded.type !== TokenType.AccessToken) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.INVALID_ACCESS_TOKEN_TYPE
        })
      }

      return decoded
    } catch (error) {
      if (error instanceof HttpException) throw error

      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.ACCESS_TOKEN_EXPIRED
        })
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.INVALID_ACCESS_TOKEN
        })
      }

      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: TOKEN_MESSAGES.ACCESS_TOKEN_VERIFICATION_FAILED
      })
    }
  }

  /**
   * Verify Refresh Token
   * ✅ Specific error messages cho refresh token
   */
  static verifyRefreshToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, envConfig.jwtRefreshTokenSecret) as DecodedToken

      // Check token type
      if (decoded.type !== TokenType.RefreshToken) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.INVALID_REFRESH_TOKEN_TYPE
        })
      }

      return decoded
    } catch (error) {
      if (error instanceof HttpException) throw error

      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.REFRESH_TOKEN_EXPIRED
        })
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: TOKEN_MESSAGES.INVALID_REFRESH_TOKEN
        })
      }

      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: TOKEN_MESSAGES.REFRESH_TOKEN_VERIFICATION_FAILED
      })
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload
    } catch (error: unknown) {
      return null
    }
  }
}
