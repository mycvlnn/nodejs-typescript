import { ObjectId } from 'mongodb'

// ====== Định nghĩa types liên quan đến User ======
export enum UserStatus {
  Unverified = 0,
  Verified = 1,
  Banned = 2,
  Active = 3
}

/**
 * User entity trong database
 */
export interface IUser {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  username?: string
  bio?: string
  location?: string
  website?: string
  avatar?: string
  cover_photo?: string

  // Metadata
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_password_token: string
  status: UserStatus
}

/**
 * DTO để tạo user mới
 */
export type IUserCreate = Omit<
  IUser,
  '_id' | 'created_at' | 'updated_at' | 'email_verify_token' | 'forgot_password_token' | 'status'
>

/**
 * DTO để update user
 */
export type IUserUpdate = Partial<Omit<IUser, '_id' | 'created_at' | 'email_verify_token' | 'forgot_password_token'>>

/**
 * Response API (không có password)
 */
export type IUserResponse = Omit<IUser, 'password' | 'email_verify_token' | 'forgot_password_token'>

/**
 * Login credentials
 */
export interface ILoginCredentials {
  email: string
  password: string
}

/**
 * Token payload
 */
export interface ITokenPayload {
  userId: string
  email: string
}
