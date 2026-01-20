import { MongoConnection } from './config/mongo-connection.js'
import { envConfig } from './config/env-config.js'
import app from './index.js'

const start = async () => {
  try {
    await MongoConnection.connect()
    app.listen(envConfig.port, () => {
      console.log(`🚀 Server running at http://localhost:${envConfig.port}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
  }
}

start()
