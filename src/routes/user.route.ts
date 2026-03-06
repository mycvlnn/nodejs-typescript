import express from 'express'
import {
  loginUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  refreshToken,
  resendEmailVerify,
  forgotPassword,
  resetPassword,
  logout,
  logoutAll,
  registerUser,
  verifyEmailToken,
  getMe
} from '~/controllers/user.controller.js'
import { createUserValidator, loginValidator, updateUserValidator } from '~/validations/user.validation.js'
import {
  accessTokenValidator,
  refreshTokenValidator,
  verifyEmailTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from '~/validations/auth.validation.js'
import { verifiedEmailMiddleware } from '~/middlewares/verified.middleware.js'

const router = express.Router()

router.post('/login', loginValidator, loginUser)
router.post('/register', createUserValidator, registerUser)
router.post('/refresh-token', refreshTokenValidator, refreshToken)
router.post('/verify-email-token', verifyEmailTokenValidator, verifyEmailToken)
router.post('/resend-verify-email', accessTokenValidator, resendEmailVerify)
router.post('/forgot-password', forgotPasswordValidator, forgotPassword)
router.post('/reset-password', resetPasswordValidator, resetPassword)

router.post('/logout', accessTokenValidator, refreshTokenValidator, logout)
router.post('/logout-all', accessTokenValidator, logoutAll)
router.get('/me', accessTokenValidator, getMe)
router.get('/', accessTokenValidator, getUsers)
router.get('/:id', accessTokenValidator, getUser)
router.put('/:id', accessTokenValidator, updateUserValidator, verifiedEmailMiddleware, updateUser)
router.delete('/:id', accessTokenValidator, deleteUser)

export default router
