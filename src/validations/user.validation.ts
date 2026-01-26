import { checkSchema } from 'express-validator'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { HttpException } from '~/core/http-exception.js'
import { UserService } from '~/services/user.service.js'
import { validate } from '~/utils/validate.js'

export const createUserValidator = validate(
  checkSchema({
    name: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: 'Name is required',
        bail: true // Nếu không có name thì không cần kiểm tra tiếp
      },
      isString: {
        errorMessage: 'Name must be a string'
      },
      isLength: {
        options: { min: 5, max: 100 },
        errorMessage: 'Name must be between 5 and 100 characters'
      }
    },
    email: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: 'Email is required',
        bail: true // Nếu không có email thì không cần kiểm tra tiếp
      },
      isEmail: {
        errorMessage: 'Invalid email format'
      },
      custom: {
        options: async (value) => {
          const isUserExist = await UserService.isEmailExist(value)
          if (isUserExist) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    date_of_birth: {
      in: ['body'],
      optional: true,
      isISO8601: {
        errorMessage: 'Date of birth must be a valid date' // ISO 8601 date format, e.g., "2023-10-15", "2023-10-15T13:45:30Z"
      }
    },
    password: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Password is required',
        bail: true // Nếu không có password thì không cần kiểm tra tiếp
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: 'Password must be between 6 and 50 characters',
        bail: true
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
      }
    },
    confirm_password: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Confirm Password is required'
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Confirm Password does not match Password')
          }
          return true
        }
      }
    },
    username: {
      in: ['body'],
      trim: true, // Loại bỏ khoảng trắng thừa
      notEmpty: {
        errorMessage: 'Username is required',
        bail: true // Nếu không có username thì không cần kiểm tra tiếp
      },
      isAlphanumeric: {
        errorMessage: 'Username must be alphanumeric' // Chỉ cho phép chữ và số
      },
      isLength: {
        options: { min: 3, max: 30 },
        errorMessage: 'Username must be between 3 and 30 characters'
      },
      custom: {
        options: async (value) => {
          const isUserExist = await UserService.isUsernameExist(value)
          if (isUserExist) {
            throw new Error('Username already exists')
          }
          return true
        }
      }
    }
  })
)

export const updateUserValidator = validate(
  checkSchema({
    id: {
      in: ['params'],
      notEmpty: {
        errorMessage: 'User ID is required'
      }
    },
    name: {
      in: ['body'],
      optional: true,
      isString: {
        errorMessage: 'Name must be a string'
      },
      isLength: {
        options: { max: 100 },
        errorMessage: 'Name must not exceed 100 characters'
      }
    },
    email: {
      in: ['body'],
      optional: true,
      isEmail: {
        errorMessage: 'Invalid email format'
      },
      custom: {
        options: async (value) => {
          const isUserExist = await UserService.isEmailExist(value)
          if (isUserExist) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    }
  })
)

export const loginValidator = validate(
  checkSchema({
    email: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: 'Email is required'
      },
      isEmail: {
        errorMessage: 'Invalid email format'
      }
    },
    password: {
      in: ['body'],
      notEmpty: {
        errorMessage: 'Password is required'
      }
    }
  })
)
