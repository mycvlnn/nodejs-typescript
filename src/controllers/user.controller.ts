import { Request, Response } from 'express'
import { BaseController } from '~/controllers/base.controller.js'
import { UserService } from '~/services/user.service.js'
import { wrapRequestHandler } from '~/utils/handler.js'

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
  loginUser = wrapRequestHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body
    const result = await this.userService.loginUser(email, password)
    this.sendSuccess(res, { message: 'Login successful', ...result })
  })

  /**
   * Get all users
   */
  getUsers = wrapRequestHandler(async (_req: Request, res: Response) => {
    const users = await this.userService.getAllUsers()
    this.sendSuccess(res, users)
  })

  /**
   * Get user by ID
   */
  getUser = wrapRequestHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const user = await this.userService.getUserById(id)
    this.sendSuccess(res, user)
  })

  /**
   * Create new user (Register)
   */
  createUser = wrapRequestHandler(async (req: Request, res: Response) => {
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
  })

  /**
   * Update user
   */
  updateUser = wrapRequestHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const userData = req.body
    const user = await this.userService.updateUser(id, userData)
    this.sendSuccess(res, user)
  })

  /**
   * Delete user
   */
  deleteUser = wrapRequestHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    await this.userService.deleteUser(id)
    this.sendSuccess(res, { message: 'User deleted successfully' })
  })

  /**
   * Refresh access token
   */
  refreshToken = wrapRequestHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new Error('Refresh token is required')
    }

    const tokens = await this.userService.refreshToken(refreshToken)

    this.sendSuccess(res, {
      message: 'Token refreshed successfully',
      ...tokens
    })
  })

  /**
   * Logout từ thiết bị hiện tại
   */
  logout = wrapRequestHandler(async (req: Request, res: Response) => {
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
  })

  /**
   * Logout từ tất cả thiết bị
   */
  logoutAll = wrapRequestHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId

    if (!userId) {
      throw new Error('User not authenticated')
    }

    await this.userService.logoutAll(userId)

    this.sendSuccess(res, {
      message: 'Logged out from all devices successfully'
    })
  })

  /**
   * Get current user profile
   */
  getProfile = wrapRequestHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId

    if (!userId) {
      throw new Error('User not authenticated')
    }

    const user = await this.userService.getUserById(userId)
    this.sendSuccess(res, user)
  })
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
