import { SignOptions } from 'jsonwebtoken'
import { TokenType } from '~/constants/enum.js'

export interface TokenPayload {
  userId: string
  email: string
  type: TokenType
}

export interface SignTokenParams {
  payload: TokenPayload
  expiresIn?: SignOptions['expiresIn']
}

export interface SignAccessTokenParams {
  payload: Omit<TokenPayload, 'type'>
  expiresIn?: SignOptions['expiresIn']
}

export type SignRefreshTokenParams = SignAccessTokenParams

export interface DecodedToken extends TokenPayload {
  iat: number
  exp: number
}
