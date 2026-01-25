import { NextFunction, Request, Response } from 'express'
import { ContextRunner } from 'express-validator'

// Hàm này nhận vào một mảng các validation và trả về một middleware
export const validate = (validations: ContextRunner[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // sequential processing, stops running validations chain if one fails.
    for (const validation of validations) {
      const result = await validation.run(req)
      if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() })
        return
      }
    }

    next()
  }
}
