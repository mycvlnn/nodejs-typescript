import { envConfig } from './config/env-config.js'
import app from './index.js'
import { MongoDBService } from '~/services/database.service.js'

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await MongoDBService.connect()
    console.log('✅ MongoDB connected')

    // 2. Initialize all models (create indexes)
    await MongoDBService.initializeModels()

    // 3. Ping to verify connection
    await MongoDBService.ping()

    // 4. Start Express server
    const server = app.listen(envConfig.port, () => {
      console.log(`🚀 Server running at http://localhost:${envConfig.port}`)
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
    })

    // 5. Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 ${signal} received. Shutting down gracefully...`)

      server.close(async () => {
        console.log('✅ HTTP server closed')

        try {
          await MongoDBService.close()
          console.log('✅ Database connection closed')
          process.exit(0)
        } catch (error) {
          console.error('❌ Error during shutdown:', error)
          process.exit(1)
        }
      })

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down')
        process.exit(1)
      }, 10000)
    }

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
