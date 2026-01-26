import { NextFunction, Request, Response } from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema.js'
import { HTTP_STATUS } from '~/constants/http-status.js'
import { EntityError, HttpException } from '~/core/http-exception.js'

// Hàm này nhận vào một mảng các validation và trả về một middleware
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      next()
      return
    }

    const errorsObject = errors.mapped()
    const entityErrors = new EntityError({ errors: {} })

    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      // Xử lý trường hợp msg là HttpException và không phải lỗi 422
      if (msg instanceof HttpException && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        next(msg)
        return
      }

      entityErrors.errors[key] = errorsObject[key]
    }

    next(entityErrors)
  }
}
