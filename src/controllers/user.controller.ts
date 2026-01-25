import { Request, Response, NextFunction } from 'express'
import { BaseController } from '~/controllers/base.controller.js'
import { UserService } from '~/services/user.service.js'

/**
 * User Controller - HTTP Request Handlers
 * Chỉ xử lý HTTP request/response, không chứa business logic
 */
export class UserController extends BaseController {
  private userService: UserService

  constructor() {
    super()
    this.userService = new UserService()
  }

  /**
   * Login user
   */
  loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body
      const result = await this.userService.loginUser(email, password)
      this.sendSuccess(res, { message: 'Login successful', ...result })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get all users
   */
  getUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers()
      this.sendSuccess(res, users)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get user by ID
   */
  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const user = await this.userService.getUserById(id)
      this.sendSuccess(res, user)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create new user (Register)
   */
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body
      const result = await this.userService.createUser(userData)
      this.sendResponse(res, 201, {
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: result.user,
          access_token: result.access_token,
          refresh_token: result.refresh_token
        }
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update user
   */
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userData = req.body
      const user = await this.userService.updateUser(id, userData)
      this.sendSuccess(res, user)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Delete user
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      await this.userService.deleteUser(id)
      this.sendSuccess(res, { message: 'User deleted successfully' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Refresh access token
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        throw new Error('Refresh token is required')
      }

      const tokens = await this.userService.refreshToken(refreshToken)

      this.sendSuccess(res, {
        message: 'Token refreshed successfully',
        ...tokens
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Logout từ thiết bị hiện tại
   */
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId
      const { refreshToken } = req.body

      if (!userId) {
        throw new Error('User not authenticated')
      }

      if (!refreshToken) {
        throw new Error('Refresh token is required')
      }

      await this.userService.logout(userId, refreshToken)

      this.sendSuccess(res, {
        message: 'Logout successful'
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Logout từ tất cả thiết bị
   */
  logoutAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId

      if (!userId) {
        throw new Error('User not authenticated')
      }

      await this.userService.logoutAll(userId)

      this.sendSuccess(res, {
        message: 'Logged out from all devices successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get current user profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const user = await this.userService.getUserById(userId)
      this.sendSuccess(res, user)
    } catch (error) {
      next(error)
    }
  }
}

// Export instances của các methods
const userController = new UserController()
export const {
  loginUser,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  refreshToken,
  logout,
  logoutAll,
  getProfile
} = userController
