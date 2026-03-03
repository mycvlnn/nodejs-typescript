import dotenv from 'dotenv'
import { SignOptions } from 'jsonwebtoken'
dotenv.config()

export const envConfig = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB_NAME,
  jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
  jwtEmailVerificationTokenSecret: process.env.JWT_EMAIL_VERIFICATION_TOKEN_SECRET as string,
  jwtAccessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  jwtRefreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  jwtEmailVerificationTokenExpiresIn: process.env.JWT_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
}
