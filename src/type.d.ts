import { TokenPayload } from './types/jwt.types.ts'

/**
 * Extend Express Request interface
 * File này sẽ được TypeScript tự động load
 */
declare global {
  namespace Express {
    interface Request {
      access_token_decoded?: TokenPayload
      refresh_token_decoded?: TokenPayload
    }
  }
}
