export const USER_MESSAGES = {
  VALIDATION_FAILED: 'User data validation failed',

  // Name
  NAME_REQUIRED: 'Name is required',
  NAME_MUST_BE_STRING: 'Name must be a string',
  NAME_LENGTH: 'Name must be between 5 and 100 characters',

  // Email
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Invalid email format',
  EMAIL_EXISTS: 'Email already exists',

  // Date of Birth
  DATE_OF_BIRTH_REQUIRED: 'Date of birth is required',
  DATE_OF_BIRTH_INVALID: 'Date of birth must be a iso8601 date',

  // Password
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_LENGTH: 'Password must be between 6 and 50 characters',
  PASSWORD_NOT_STRONG_ENOUGH:
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol',
  PASSWORD_CONFIRM_REQUIRED: 'Confirm Password is required',
  PASSWORDS_DO_NOT_MATCH: 'Password and Confirm Password do not match',

  // Username
  USER_NAME_REQUIRED: 'Username is required',
  USER_NAME_MUST_BE_ALPHANUMERIC: 'Username must be alphanumeric',
  USER_NAME_LENGTH: 'Username must be between 3 and 30 characters',
  USERNAME_EXISTS: 'Username already exists',

  // Bio
  BIO_LENGTH: 'Bio must not exceed 500 characters',

  // Location
  LOCATION_LENGTH: 'Location must not exceed 100 characters',

  // Update user
  USER_ID_REQUIRED: 'User ID is required'
} as const
