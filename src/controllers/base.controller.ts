import { Response } from 'express'

// Base Controller cung cấp các phương thức chung cho tất cả controllers
export abstract class BaseController {
  protected sendResponse(res: Response, statusCode: number, data: any) {
    return res.status(statusCode).json(data)
  }

  protected sendSuccess(res: Response, data: any) {
    return this.sendResponse(res, 200, { status: 'success', data })
  }

  protected sendError(res: Response, statusCode: number, message: string) {
    return this.sendResponse(res, statusCode, { status: 'error', message })
  }
}
