import { body } from 'express-validator'
import { UserService } from '~/services/user.service.js'

export const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .custom(async (value) => {
      const isUserExist = await UserService.isEmailExist(value)
      if (isUserExist) {
        throw new Error('Email already exists')
      }
      return true
    }),
  body('date_of_birth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirm_password')
    .notEmpty()
    .withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm Password does not match Password')
      }
      return true
    })
]

export const updateUserValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format')
]

export const loginValidator = [
  body('email').escape().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
]
