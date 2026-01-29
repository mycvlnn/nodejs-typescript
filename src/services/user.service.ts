import bcrypt from 'bcrypt'
import _ from 'lodash'
import { UserModel } from '~/models/user.model.js'
import { RefreshTokenModel } from '~/models/refresh_token.model.js'
import { HttpException } from '~/core/http-exception.js'
import { JWTUtils } from '~/utils/jwt.js'
import { envConfig } from '~/config/env-config.js'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { IUser, IUserCreate, IUserUpdate, UserStatus } from '~/types/user.types.js'
import { AUTH_MESSAGES, TOKEN_MESSAGES } from '~/constants/messages.js'
import { DecodedToken } from '~/types/jwt.types.js'

/**
 * User Service - Business Logic Layer
 * Chứa toàn bộ logic nghiệp vụ, validation, và xử lý dữ liệu
 */
export class UserService {
  private getExpiresAt() {
    const expiresAt = new Date()
    const daysExpire = envConfig.jwtRefreshTokenExpiresIn?.toString().replace('d', '') as string
    expiresAt.setDate(expiresAt.getDate() + Number(daysExpire))
    return expiresAt
  }

  /**
   * Check email exist
   */
  static async isEmailExist(email: string): Promise<boolean> {
    const exists = await UserModel.existsByEmail(email)
    return exists
  }

  /**
   * Check username exist
   */
  static async isUsernameExist(username: string): Promise<boolean> {
    const exists = await UserModel.existsByUsername(username)
    return exists
  }

  /**
   * Lấy tất cả users (không trả về password)
   */
  async getAllUsers(): Promise<IUser[]> {
    try {
      const users = await UserModel.findAll()
      // Remove passwords khỏi response
      return users.map((user) => UserModel.toResponse(user) as IUser)
    } catch (error: any) {
      throw new HttpException({
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: `Failed to fetch users: ${error.message}`
      })
    }
  }

  /**
   * Lấy user theo ID
   */
  async getUserById(id: string): Promise<IUser> {
    const user = await UserModel.findById(id)

    if (!user) {
      throw new HttpException({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'User not found'
      })
    }

    return UserModel.toResponse(user) as IUser
  }

  /**
   * Tạo user mới (Register)
   */
  async createUser(userData: IUserCreate): Promise<{
    user: IUser
    access_token: string
    refresh_token: string
  }> {
    try {
      // Hash password trước khi lưu
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      const userDataUpdated = { ..._.omit(userData, 'confirm_password'), password: hashedPassword }

      // Tạo user mới
      const user = await UserModel.create(userDataUpdated)

      // Generate JWT tokens
      const tokens = JWTUtils.generateTokens({
        userId: user._id!.toString(),
        email: user.email
      })

      await RefreshTokenModel.create({
        user_id: user._id!,
        token: tokens.refreshToken,
        expires_at: this.getExpiresAt()
      })

      return {
        user: UserModel.toResponse(user) as IUser,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken
      }
    } catch (error: any) {
      if (error instanceof HttpException) throw error
      throw new HttpException({
        status: HTTP_STATUS.BAD_REQUEST,
        message: `Failed to create user: ${error.message}`
      })
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: IUserUpdate): Promise<IUser> {
    // Kiểm tra user có tồn tại không
    const existingUser = await UserModel.findById(id)
    if (!existingUser) {
      throw new HttpException({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'User not found'
      })
    }

    try {
      const updatedUser = await UserModel.updateById(id, userData)

      if (!updatedUser) {
        throw new HttpException({
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Failed to update user'
        })
      }

      return UserModel.toResponse(updatedUser) as IUser
    } catch (error: any) {
      if (error instanceof HttpException) throw error
      throw new HttpException({
        status: HTTP_STATUS.BAD_REQUEST,
        message: `Failed to update user: ${error.message}`
      })
    }
  }

  /**
   * Xóa user
   */
  async deleteUser(id: string): Promise<void> {
    const deleted = await UserModel.deleteById(id)

    if (!deleted) {
      throw new HttpException({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'User not found'
      })
    }
  }

  /**
   * Login user
   */
  async loginUser(
    email: string,
    password: string
  ): Promise<{
    user: IUser
    access_token: string
    refresh_token: string
  }> {
    const user = await UserModel.findByEmail(email)

    if (!user) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: AUTH_MESSAGES.INVALID_USER_CREDENTIALS
      })
    }

    if (!user.status || user.status !== UserStatus.Active) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: AUTH_MESSAGES.ACCOUNT_NOT_ACTIVE
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: AUTH_MESSAGES.INVALID_USER_CREDENTIALS
      })
    }

    // Generate JWT tokens
    const tokens = JWTUtils.generateTokens({
      userId: user._id!.toString(),
      email: user.email
    })

    await RefreshTokenModel.create({
      user_id: user._id!,
      token: tokens.refreshToken,
      expires_at: this.getExpiresAt()
    })

    return {
      user: UserModel.toResponse(user) as IUser,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    }
  }

  async refreshToken(
    refreshToken: string,
    userData?: DecodedToken
  ): Promise<{
    access_token: string
    refresh_token: string
  }> {
    // Kiểm tra thông tin user được decode từ refresh token.
    if (!userData?.userId) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: AUTH_MESSAGES.USER_NOT_FOUND
      })
    }

    // Check if refresh token exists in database
    const tokenDoc = await RefreshTokenModel.findByToken(refreshToken)

    if (!tokenDoc) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: TOKEN_MESSAGES.REFRESH_TOKEN_NOT_FOUND
      })
    }

    await RefreshTokenModel.deleteByToken(refreshToken)

    // Tính toán thời gian còn lại của refresh token
    const now = new Date()
    const remainingTime = Math.max(tokenDoc.expires_at.getTime() - now.getTime(), 0)

    // Trường hợp token hết hạn
    if (remainingTime <= 0) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: TOKEN_MESSAGES.REFRESH_TOKEN_EXPIRED
      })
    }

    const oldExpiresAt = new Date(now.getTime() + remainingTime)

    // Tạo refreshToken mới dựa trên expire time cũ
    const newRefreshToken = JWTUtils.generateRefreshToken({
      payload: {
        email: userData.email,
        userId: userData.userId
      },
      expiresIn: Math.floor(remainingTime / 1000) // in seconds
    })

    const newAccessToken = JWTUtils.generateAccessToken({
      payload: {
        email: userData.email,
        userId: userData.userId
      }
    })

    // Store new refresh token với preserved expire time
    await RefreshTokenModel.create({
      user_id: tokenDoc.user_id,
      token: newRefreshToken,
      expires_at: oldExpiresAt
    })

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    }
  }

  /**
   * Logout từ thiết bị hiện tại (xóa 1 refresh token)
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    const isDeletedSuccess = await RefreshTokenModel.deleteByUserAndToken(userId, refreshToken)
    if (!isDeletedSuccess) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: TOKEN_MESSAGES.REFRESH_TOKEN_NOT_FOUND
      })
    }
  }

  /**
   * Logout từ tất cả thiết bị (xóa tất cả refresh tokens)
   */
  async logoutAll(userId: string): Promise<void> {
    await RefreshTokenModel.deleteAllByUserId(userId)
  }
}
