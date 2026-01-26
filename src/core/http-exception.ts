import { HTTP_STATUS } from '~/constants/http-status.js'
import { USER_MESSAGES } from '~/constants/messages.js'

export class HttpException {
  status: number
  message: string
  error_info?: any

  constructor({ status, message, error_info }: { status: number; message: string; error_info?: any }) {
    this.status = status
    this.message = message
    this.error_info = error_info
  }
}

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class EntityError extends HttpException {
  errors: ErrorsType

  constructor({ message = USER_MESSAGES.VALIDATION_FAILED, errors }: { message?: string; errors: ErrorsType }) {
    super({ status: HTTP_STATUS.UNPROCESSABLE_ENTITY, message })
    this.errors = errors
  }
}
