import jwt from 'jsonwebtoken'
import { envConfig } from '~/config/env-config.js'
import { TokenType } from '~/constants/enum.js'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { HttpException } from '~/core/http-exception.js'

export interface TokenPayload {
  userId: string
  email: string
  type: TokenType
}

export class JWTUtils {
  /**
   * Generate Access Token
   */
  static generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        type: TokenType.AccessToken
      },
      envConfig.jwtSecret,
      {
        expiresIn: envConfig.jwtAccessTokenExpiresIn
      }
    )
  }

  /**
   * Generate Refresh Token
   */
  static generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
    return jwt.sign(
      {
        ...payload,
        type: TokenType.RefreshToken
      },
      envConfig.jwtSecret,
      {
        expiresIn: envConfig.jwtRefreshTokenExpiresIn
      }
    )
  }

  /**
   * Generate both tokens
   */
  static generateTokens(payload: Omit<TokenPayload, 'type'>): {
    accessToken: string
    refreshToken: string
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    }
  }

  /**
   * Verify token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, envConfig.jwtSecret) as TokenPayload
      return decoded
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: 'Token expired'
        })
      }
      if (error.name === 'JsonWebTokenError') {
        throw new HttpException({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: 'Invalid token'
        })
      }
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: 'Token verification failed'
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
