import dotenv from 'dotenv'
import { SignOptions } from 'jsonwebtoken'
dotenv.config()

export const envConfig = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB_NAME,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtAccessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
  jwtRefreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
}
