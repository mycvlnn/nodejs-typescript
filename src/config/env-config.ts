import dotenv from 'dotenv'
dotenv.config()

export const envConfig = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB_NAME
}
