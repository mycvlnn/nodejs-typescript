// Định nghĩa các schema validation chung

import { ParamSchema } from 'express-validator'
import { USER_MESSAGES } from '~/constants/messages.js'

export const passwordSchema: ParamSchema = {
  in: ['body'],
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSWORD_REQUIRED,
    bail: true // Nếu không có password thì không cần kiểm tra tiếp
  },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: USER_MESSAGES.PASSWORD_LENGTH,
    bail: true
  },
  isStrongPassword: {
    options: {
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGES.PASSWORD_NOT_STRONG_ENOUGH
  }
}

export const passwordConfirmSchema: ParamSchema = {
  in: ['body'],
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSWORD_CONFIRM_REQUIRED,
    bail: true
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.PASSWORDS_DO_NOT_MATCH)
      }
      return true
    }
  }
}

export const emailSchema: ParamSchema = {
  in: ['body'],
  trim: true,
  notEmpty: {
    errorMessage: USER_MESSAGES.EMAIL_REQUIRED,
    bail: true
  },
  isEmail: {
    errorMessage: USER_MESSAGES.EMAIL_INVALID
  }
}
