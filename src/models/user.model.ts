import { Collection, ObjectId } from 'mongodb'
import { MongoDBService } from '~/services/database.service.js'

// ========== INTERFACES ==========
export enum UserStatus {
  Unverified = 0,
  Verified = 1,
  Banned = 2,
  Active = 3
}

export interface IUser {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string

  created_at: Date
  updated_at: Date

  email_verify_token: string
  forgot_password_token: string
  status: UserStatus

  username?: string
  bio?: string
  location?: string
  website?: string
  avatar?: string
  cover_photo?: string
}

export type IUserCreate = Omit<
  IUser,
  '_id' | 'created_at' | 'updated_at' | 'email_verify_token' | 'forgot_password_token' | 'status'
>

export type IUserUpdate = Partial<Omit<IUser, '_id' | 'created_at' | 'email_verify_token' | 'forgot_password_token'>>

export type IUserResponse = Omit<IUser, 'password'>

// ========== MODEL CLASS ==========
export class UserModel {
  private static readonly COLLECTION_NAME = 'users'
  private static collection: Collection<IUser> | null = null

  /**
   * Get collection với singleton pattern
   */
  static getCollection(): Collection<IUser> {
    if (!this.collection) {
      const db = MongoDBService.getDB()
      this.collection = db.collection<IUser>(this.COLLECTION_NAME)
    }
    return this.collection
  }

  /**
   * Initialize indexes - gọi 1 lần khi app start
   */
  static async initialize(): Promise<void> {
    const collection = this.getCollection()

    try {
      // 1. Email - UNIQUE (bắt buộc)
      await collection.createIndex({ email: 1 }, { unique: true })

      // 2. Username - UNIQUE (nếu có)
      await collection.createIndex({ username: 1 }, { unique: true, sparse: true })

      // 3. Created date - Sắp xếp users mới nhất
      await collection.createIndex({ created_at: -1 })

      // 4. Status - Lọc users theo trạng thái
      await collection.createIndex({ status: 1 })

      // 5. Composite: Status + Created (query phức tạp)
      await collection.createIndex({ status: 1, created_at: -1 })
      console.log('✅ UserModel: Indexes created successfully')
    } catch (error: unknown) {
      console.error('❌ UserModel: Failed to create indexes:', error)
      throw error
    }
  }

  // ========== QUERY HELPERS ==========

  /**
   * Tìm user theo ID
   */
  static async findById(id: string | ObjectId): Promise<IUser | null> {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id
      return await this.getCollection().findOne({ _id: objectId })
    } catch (error) {
      return null
    }
  }

  /**
   * Tìm user theo email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    return await this.getCollection().findOne({ email })
  }

  /**
   * Kiểm tra email đã tồn tại chưa
   */
  static async existsByEmail(email: string): Promise<boolean> {
    const count = await this.getCollection().countDocuments({ email }, { limit: 1 })
    return count > 0
  }

  static async existsByUsername(username: string): Promise<boolean> {
    const count = await this.getCollection().countDocuments({ username }, { limit: 1 })
    return count > 0
  }

  /**
   * Lấy tất cả users
   */
  static async findAll(): Promise<IUser[]> {
    return await this.getCollection().find().toArray()
  }

  /**
   * Tạo user mới
   */
  static async create(userData: IUserCreate): Promise<IUser> {
    const user: IUser = {
      ...userData,
      created_at: new Date(),
      updated_at: new Date(),
      email_verify_token: '',
      forgot_password_token: '',
      status: UserStatus.Active
    }

    const result = await this.getCollection().insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  /**
   * Update user theo ID
   */
  static async updateById(id: string | ObjectId, data: IUserUpdate): Promise<IUser | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id

    const result = await this.getCollection().findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          ...data,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return result || null
  }

  /**
   * Xóa user theo ID
   */
  static async deleteById(id: string | ObjectId): Promise<boolean> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id
    const result = await this.getCollection().deleteOne({ _id: objectId })
    return result.deletedCount > 0
  }

  /**
   * Convert user sang response (remove password)
   */
  static toResponse(user: IUser): IUserResponse {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  /**
   * Đếm số lượng users
   */
  static async countDocuments(filter: any = {}): Promise<number> {
    return await this.getCollection().countDocuments(filter)
  }
}
