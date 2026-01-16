import dotenv from 'dotenv'
dotenv.config()

export const envConfig = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.DB_NAME
}

console.log('✅ Environment configuration loaded:', {
  port: envConfig.port,
  mongoUri: envConfig.mongoUri || 'not set',
  mongoDbName: envConfig.mongoDbName || 'not set'
})
