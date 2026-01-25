import bcrypt from 'bcrypt'
import { UserModel, IUser, IUserCreate, IUserUpdate, UserStatus } from '~/models/user.model.js'
import { RefreshTokenModel } from '~/models/refresh-token.model.js'
import { HttpException } from '~/core/http-exception.js'
import { JWTUtils } from '~/utils/jwt.js'
import { envConfig } from '~/config/env-config.js'
import { TokenType } from '~/constants/enum.js'

/**
 * User Service - Business Logic Layer
 * Chứa toàn bộ logic nghiệp vụ, validation, và xử lý dữ liệu
 */
export class UserService {
  getExpiresAt() {
    const expiresAt = new Date()
    const daysExpire = envConfig.jwtRefreshTokenExpiresIn?.toString().replace('d', '') as string
    expiresAt.setDate(expiresAt.getDate() + Number(daysExpire))
    return expiresAt
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
      throw new HttpException(500, `Failed to fetch users: ${error.message}`)
    }
  }

  /**
   * Lấy user theo ID
   */
  async getUserById(id: string): Promise<IUser> {
    const user = await UserModel.findById(id)

    if (!user) {
      throw new HttpException(404, 'User not found')
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

      // Tạo user mới
      const user = await UserModel.create({
        ...userData,
        password: hashedPassword
      })

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
      throw new HttpException(400, `Failed to create user: ${error.message}`)
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: IUserUpdate): Promise<IUser> {
    // Kiểm tra user có tồn tại không
    const existingUser = await UserModel.findById(id)
    if (!existingUser) {
      throw new HttpException(404, 'User not found')
    }

    // Nếu update email, kiểm tra trùng lặp
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await UserModel.existsByEmail(userData.email)
      if (emailExists) {
        throw new HttpException(409, 'Email already exists')
      }
    }

    try {
      const updatedUser = await UserModel.updateById(id, userData)

      if (!updatedUser) {
        throw new HttpException(500, 'Failed to update user')
      }

      return UserModel.toResponse(updatedUser) as IUser
    } catch (error: any) {
      if (error instanceof HttpException) throw error
      throw new HttpException(400, `Failed to update user: ${error.message}`)
    }
  }

  /**
   * Xóa user
   */
  async deleteUser(id: string): Promise<void> {
    const deleted = await UserModel.deleteById(id)

    if (!deleted) {
      throw new HttpException(404, 'User not found')
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
      throw new HttpException(401, 'Invalid email or password')
    }

    if (!user.status || user.status !== UserStatus.Active) {
      throw new HttpException(401, 'Account is not active')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new HttpException(401, 'Invalid email or password')
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
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    access_token: string
    refresh_token: string
  }> {
    // Verify refresh token
    const decoded = JWTUtils.verifyToken(refreshToken)

    if (decoded.type !== TokenType.RefreshToken) {
      throw new HttpException(401, 'Invalid token type')
    }

    // Check if refresh token exists in database
    const tokenDoc = await RefreshTokenModel.findByToken(refreshToken)

    if (!tokenDoc) {
      throw new HttpException(401, 'Invalid refresh token')
    }

    // Kiểm tra token còn hạn không
    if (tokenDoc.expires_at < new Date()) {
      await RefreshTokenModel.deleteByToken(refreshToken)
      throw new HttpException(401, 'Refresh token expired')
    }

    // Get user info
    const user = await UserModel.findById(tokenDoc.user_id)

    if (!user) {
      throw new HttpException(401, 'User not found')
    }

    // Xóa refresh token cũ
    await RefreshTokenModel.deleteByToken(refreshToken)

    // Generate new tokens
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
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    }
  }

  /**
   * Logout từ thiết bị hiện tại (xóa 1 refresh token)
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    await RefreshTokenModel.deleteByUserAndToken(userId, refreshToken)
  }

  /**
   * Logout từ tất cả thiết bị (xóa tất cả refresh tokens)
   */
  async logoutAll(userId: string): Promise<void> {
    await RefreshTokenModel.deleteAllByUserId(userId)
  }
}
