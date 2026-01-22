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
   * Create new user
   */
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body
      const user = await this.userService.createUser(userData)
      this.sendResponse(res, 201, { status: 'success', data: user })
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
}

// Export instances của các methods
const userController = new UserController()
export const { loginUser, getUsers, getUser, createUser, updateUser, deleteUser } = userController
