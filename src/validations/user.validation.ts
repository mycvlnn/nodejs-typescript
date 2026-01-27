import { checkSchema } from 'express-validator'
import { USER_MESSAGES } from '~/constants/messages.js'
import { UserService } from '~/services/user.service.js'
import { validate } from '~/utils/validate.js'

export const createUserValidator = validate(
  checkSchema({
    name: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: USER_MESSAGES.NAME_REQUIRED,
        bail: true // Nếu không có name thì không cần kiểm tra tiếp
      },
      isString: {
        errorMessage: USER_MESSAGES.NAME_MUST_BE_STRING
      },
      isLength: {
        options: { min: 5, max: 100 },
        errorMessage: USER_MESSAGES.NAME_LENGTH
      }
    },
    email: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_REQUIRED,
        bail: true
      },
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_INVALID
      },
      custom: {
        options: async (value) => {
          const isUserExist = await UserService.isEmailExist(value)
          if (isUserExist) {
            throw new Error(USER_MESSAGES.EMAIL_EXISTS)
          }
          return true
        }
      }
    },
    password: {
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
    },
    confirm_password: {
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
    },
    date_of_birth: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: USER_MESSAGES.DATE_OF_BIRTH_REQUIRED,
        bail: true
      },
      isISO8601: {
        errorMessage: USER_MESSAGES.DATE_OF_BIRTH_INVALID // ISO 8601 date format, e.g., "2023-10-15", "2023-10-15T13:45:30Z"
      }
    },
    username: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: USER_MESSAGES.USER_NAME_REQUIRED,
        bail: true
      },
      isAlphanumeric: {
        errorMessage: USER_MESSAGES.USER_NAME_MUST_BE_ALPHANUMERIC // Chỉ cho phép chữ và số
      },
      isLength: {
        options: { min: 3, max: 30 },
        errorMessage: USER_MESSAGES.USER_NAME_LENGTH
      },
      custom: {
        options: async (value) => {
          const isUserExist = await UserService.isUsernameExist(value)
          if (isUserExist) {
            throw new Error(USER_MESSAGES.USERNAME_EXISTS)
          }
          return true
        }
      }
    },
    bio: {
      in: ['body'],
      trim: true,
      optional: true,
      isLength: {
        options: { max: 500 },
        errorMessage: USER_MESSAGES.BIO_LENGTH
      }
    },
    location: {
      in: ['body'],
      trim: true,
      optional: true,
      isLength: {
        options: { max: 100 },
        errorMessage: USER_MESSAGES.LOCATION_LENGTH
      }
    },
    website: {
      in: ['body'],
      trim: true,
      optional: true
    },
    avatar: {
      in: ['body'],
      trim: true,
      optional: true
    },
    cover_photo: {
      in: ['body'],
      trim: true,
      optional: true
    }
  })
)

export const updateUserValidator = validate(
  checkSchema({
    id: {
      in: ['params'],
      notEmpty: {
        errorMessage: USER_MESSAGES.USER_ID_REQUIRED
      }
    },
    name: {
      in: ['body'],
      trim: true,
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.NAME_MUST_BE_STRING
      },
      isLength: {
        options: { min: 5, max: 100 },
        errorMessage: USER_MESSAGES.NAME_LENGTH
      }
    },
    email: {
      in: ['body'],
      trim: true,
      optional: true,
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_INVALID
      },
      custom: {
        options: async (value) => {
          const isUserExist = await UserService.isEmailExist(value)
          if (isUserExist) {
            throw new Error(USER_MESSAGES.EMAIL_EXISTS)
          }
          return true
        }
      }
    },
    date_of_birth: {
      in: ['body'],
      trim: true,
      optional: true,
      isISO8601: {
        errorMessage: USER_MESSAGES.DATE_OF_BIRTH_INVALID // ISO 8601 date format, e.g., "2023-10-15", "2023-10-15T13:45:30Z"
      }
    },
    username: {
      in: ['body'],
      trim: true,
      optional: true,
      isAlphanumeric: {
        errorMessage: USER_MESSAGES.USER_NAME_MUST_BE_ALPHANUMERIC // Chỉ cho phép chữ và số
      },
      isLength: {
        options: { min: 3, max: 30 },
        errorMessage: USER_MESSAGES.USER_NAME_LENGTH
      },
      custom: {
        options: async (value) => {
          const isUserExist = await UserService.isUsernameExist(value)
          if (isUserExist) {
            throw new Error(USER_MESSAGES.USERNAME_EXISTS)
          }
          return true
        }
      }
    },
    bio: {
      in: ['body'],
      trim: true,
      optional: true,
      isLength: {
        options: { max: 500 },
        errorMessage: USER_MESSAGES.BIO_LENGTH
      }
    },
    location: {
      in: ['body'],
      trim: true,
      optional: true,
      isLength: {
        options: { max: 100 },
        errorMessage: USER_MESSAGES.LOCATION_LENGTH
      }
    },
    website: {
      in: ['body'],
      trim: true,
      optional: true
    },
    avatar: {
      in: ['body'],
      trim: true,
      optional: true
    },
    cover_photo: {
      in: ['body'],
      trim: true,
      optional: true
    }
  })
)

export const loginValidator = validate(
  checkSchema({
    email: {
      in: ['body'],
      trim: true,
      notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_REQUIRED,
        bail: true
      },
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_INVALID
      }
    },
    password: {
      in: ['body'],
      notEmpty: {
        errorMessage: USER_MESSAGES.PASSWORD_REQUIRED
      }
    }
  })
)
