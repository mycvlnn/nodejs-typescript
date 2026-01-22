import { Request, Response, NextFunction } from 'express'
import { HttpException } from '~/core/http-exception.js'

/**
 * Validation middleware cho create user
 */
export const validateCreateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new HttpException(400, 'Name is required and must be a non-empty string')
  }

  if (name.length > 100) {
    throw new HttpException(400, 'Name must not exceed 100 characters')
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    throw new HttpException(400, 'Email is required')
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    throw new HttpException(400, 'Invalid email format')
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    throw new HttpException(400, 'Password is required')
  }

  if (password.length < 6) {
    throw new HttpException(400, 'Password must be at least 6 characters')
  }

  next()
}

/**
 * Validation middleware cho update user
 */
export const validateUpdateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, phoneNumber, gender } = req.body

  // Validate name (optional)
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new HttpException(400, 'Name must be a non-empty string')
    }
    if (name.length > 100) {
      throw new HttpException(400, 'Name must not exceed 100 characters')
    }
  }

  // Validate email (optional)
  if (email !== undefined) {
    if (typeof email !== 'string') {
      throw new HttpException(400, 'Email must be a string')
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      throw new HttpException(400, 'Invalid email format')
    }
  }

  // Validate phone number (optional)
  if (phoneNumber !== undefined) {
    if (typeof phoneNumber !== 'string') {
      throw new HttpException(400, 'Phone number must be a string')
    }
    if (phoneNumber.length < 10 || phoneNumber.length > 15) {
      throw new HttpException(400, 'Phone number must be between 10 and 15 characters')
    }
  }

  // Validate gender (optional)
  if (gender !== undefined) {
    const validGenders = ['male', 'female', 'other']
    if (!validGenders.includes(gender)) {
      throw new HttpException(400, 'Gender must be male, female, or other')
    }
  }

  next()
}

/**
 * Validation middleware cho login
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || typeof email !== 'string') {
    throw new HttpException(400, 'Email is required')
  }

  if (!password || typeof password !== 'string') {
    throw new HttpException(400, 'Password is required')
  }

  next()
}
