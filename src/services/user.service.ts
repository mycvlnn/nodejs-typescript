import bcrypt from 'bcrypt'
import { UserModel, IUser, IUserCreate, IUserUpdate, UserStatus } from '~/models/user.model.js'
import { HttpException } from '~/core/http-exception.js'

/**
 * User Service - Business Logic Layer
 * Chứa toàn bộ logic nghiệp vụ, validation, và xử lý dữ liệu
 */
export class UserService {
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
   * Tạo user mới
   */
  async createUser(userData: IUserCreate): Promise<IUser> {
    try {
      // Hash password trước khi lưu
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // Tạo user mới
      const user = await UserModel.create({
        ...userData,
        password: hashedPassword
      })

      return UserModel.toResponse(user) as IUser
    } catch (error: any) {
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
  async loginUser(email: string, password: string): Promise<{ user: IUser }> {
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

    // TODO: Generate JWT token here if needed
    // const token = generateToken(user._id)

    return {
      user: UserModel.toResponse(user) as IUser
      // token
    }
  }

  /**
   * Check email exist
   */
  static async isEmailExist(email: string): Promise<boolean> {
    const exists = await UserModel.existsByEmail(email)
    return exists
  }
}
