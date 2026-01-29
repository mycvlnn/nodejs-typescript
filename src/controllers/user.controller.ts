import { Request, Response } from 'express'
import { matchedData } from 'express-validator'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { AUTH_MESSAGES, TOKEN_MESSAGES } from '~/constants/messages.js'
import { BaseController } from '~/controllers/base.controller.js'
import { HttpException } from '~/core/http-exception.js'
import { UserService } from '~/services/user.service.js'
import { IUserCreate, IUserUpdate } from '~/types/user.types.js'
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
    // Chỉ lấy những fields đã được validate (Tránh gửi thừa dữ liệu)
    const userData = matchedData<IUserCreate>(req)

    const result = await this.userService.createUser(userData)
    this.sendResponse(res, HTTP_STATUS.CREATED, {
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
    const userData = matchedData<IUserUpdate>(req)
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

  refreshToken = wrapRequestHandler(async (req: Request, res: Response) => {
    const { refresh_token } = req.body
    const userDecoded = req?.refresh_token_decoded

    const tokens = await this.userService.refreshToken(refresh_token, userDecoded)

    this.sendSuccess(res, {
      message: TOKEN_MESSAGES.TOKEN_REFRESH_SUCCESS,
      ...tokens
    })
  })

  /**
   * Logout từ thiết bị hiện tại
   */
  logout = wrapRequestHandler(async (req: Request, res: Response) => {
    const userId = req.access_token_decoded?.userId
    const { refresh_token } = req.body

    if (!userId) {
      throw new HttpException({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: AUTH_MESSAGES.USER_NOT_FOUND
      })
    }

    await this.userService.logout(userId, refresh_token)

    this.sendSuccess(res, {
      message: AUTH_MESSAGES.LOGOUT_SUCCESS
    })
  })

  /**
   * Logout từ tất cả thiết bị
   */
  logoutAll = wrapRequestHandler(async (req: Request, res: Response) => {
    const userId = req.access_token_decoded?.userId

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
    const userId = req.access_token_decoded?.userId

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
