import { TokenType } from '~/constants/enum.js'

export interface TokenPayload {
  userId: string
  email: string
  type: TokenType
}
