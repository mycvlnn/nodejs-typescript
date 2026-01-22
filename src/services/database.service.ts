import { MongoClient, Db, ServerApiVersion } from 'mongodb'
import { envConfig } from '~/config/env-config.js'

export class MongoDBService {
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

  static async initializeModels(): Promise<void> {
    // Import và initialize tất cả models
    const { UserModel } = await import('~/models/user.model.js')
    await UserModel.initialize()
    // Thêm các models khác ở đây khi cần
    // const { ProductModel } = await import('~/models/product.model.js')
    // await ProductModel.initialize()

    console.log('✅ All models initialized with indexes')
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
