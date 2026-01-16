import { MongoClient, Db, ServerApiVersion } from 'mongodb'
import { envConfig } from './env-config.js'

export class MongoConnection {
  private static client: MongoClient
  private static db: Db

  static async connect(): Promise<void> {
    if (!this.client) {
      this.client = new MongoClient(envConfig.mongoUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true
        }
      })

      await this.client.connect()
      this.db = this.client.db(envConfig.mongoDbName)
      console.log('✅ MongoDB connected')
    }
  }

  static getDB(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Please call connect() first.')
    }
    return this.db
  }

  static async ping(): Promise<void> {
    const db = this.getDB()
    await db.command({ ping: 1 })
    console.log('🏓 Pinged MongoDB deployment successfully.')
  }

  static async close(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = undefined as any
      this.db = undefined as any
      console.log('🛑 MongoDB connection closed')
    }
  }
}
