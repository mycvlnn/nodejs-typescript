import { Collection, ObjectId } from 'mongodb'
import { MongoDBService } from '~/services/database.service.js'

// ========== INTERFACES ==========
export interface IRefreshToken {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  created_at: Date
  expires_at: Date

  // Optional: Thông tin thiết bị và tracking
  device_info?: string
  ip_address?: string
  user_agent?: string
}

export type IRefreshTokenCreate = Omit<IRefreshToken, '_id' | 'created_at'>

// ========== MODEL CLASS ==========
export class RefreshTokenModel {
  private static readonly COLLECTION_NAME = 'refresh_tokens'
  private static collection: Collection<IRefreshToken> | null = null

  /**
   * Get collection với singleton pattern
   */
  private static getCollection(): Collection<IRefreshToken> {
    if (!this.collection) {
      const db = MongoDBService.getDB()
      this.collection = db.collection<IRefreshToken>(this.COLLECTION_NAME)
    }
    return this.collection
  }

  /**
   * Initialize indexes - gọi 1 lần khi app start
   */
  static async initialize(): Promise<void> {
    const collection = this.getCollection()

    try {
      // 1. User ID - Query tokens của 1 user
      await collection.createIndex({ user_id: 1 })

      // 2. Token - Tìm token cụ thể (UNIQUE)
      await collection.createIndex({ token: 1 }, { unique: true })

      // 3. Expires at - TTL index để tự động xóa tokens hết hạn
      await collection.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })

      // 4. Composite: user_id + token (query nhanh hơn)
      await collection.createIndex({ user_id: 1, token: 1 })

      console.log('✅ RefreshTokenModel: Indexes created successfully')
    } catch (error: unknown) {
      console.error('❌ RefreshTokenModel: Failed to create indexes:', error)
      throw error
    }
  }

  // ========== CRUD OPERATIONS ==========

  /**
   * Tạo refresh token mới
   */
  static async create(tokenData: IRefreshTokenCreate): Promise<IRefreshToken> {
    const refreshToken: IRefreshToken = {
      ...tokenData,
      created_at: new Date()
    }

    const result = await this.getCollection().insertOne(refreshToken)
    return { ...refreshToken, _id: result.insertedId }
  }

  /**
   * Tìm token theo string
   */
  static async findByToken(token: string): Promise<IRefreshToken | null> {
    return await this.getCollection().findOne({ token })
  }

  /**
   * Tìm tất cả tokens của 1 user
   */
  static async findByUserId(userId: string | ObjectId): Promise<IRefreshToken[]> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId
    return await this.getCollection().find({ user_id: objectId }).toArray()
  }

  /**
   * Kiểm tra token có hợp lệ không (tồn tại và chưa hết hạn)
   */
  static async isValid(userId: string | ObjectId, token: string): Promise<boolean> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId

    const refreshToken = await this.getCollection().findOne({
      user_id: objectId,
      token,
      expires_at: { $gt: new Date() } // Chưa hết hạn
    })

    return !!refreshToken
  }

  /**
   * Xóa 1 refresh token (logout từ 1 thiết bị)
   */
  static async deleteByToken(token: string): Promise<boolean> {
    const result = await this.getCollection().deleteOne({ token })
    return result.deletedCount > 0
  }

  /**
   * Xóa 1 token cụ thể của user
   */
  static async deleteByUserAndToken(userId: string | ObjectId, token: string): Promise<boolean> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId

    const result = await this.getCollection().deleteOne({
      user_id: objectId,
      token
    })

    return result.deletedCount > 0
  }

  /**
   * Xóa tất cả tokens của 1 user (logout all devices)
   */
  static async deleteAllByUserId(userId: string | ObjectId): Promise<number> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId

    const result = await this.getCollection().deleteMany({ user_id: objectId })
    return result.deletedCount
  }

  /**
   * Xóa tất cả tokens hết hạn (cleanup job)
   */
  static async deleteExpired(): Promise<number> {
    const result = await this.getCollection().deleteMany({
      expires_at: { $lt: new Date() }
    })
    return result.deletedCount
  }

  /**
   * Đếm số tokens của 1 user
   */
  static async countByUserId(userId: string | ObjectId): Promise<number> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId
    return await this.getCollection().countDocuments({ user_id: objectId })
  }

  /**
   * Lấy thông tin user từ token
   */
  static async getUserIdFromToken(token: string): Promise<ObjectId | null> {
    const refreshToken = await this.findByToken(token)
    return refreshToken ? refreshToken.user_id : null
  }
}
