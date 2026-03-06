import express from 'express'
import {
  loginUser,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  refreshToken,
  verifyEmail,
  resendEmailVerify,
  forgotPassword,
  resetPassword,
  logout,
  logoutAll,
  getProfile
} from '~/controllers/user.controller.js'
import { createUserValidator, loginValidator, updateUserValidator } from '~/validations/user.validation.js'
import {
  accessTokenValidator,
  refreshTokenValidator,
  verifyEmailValidator,
  resendEmailVerifyValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} from '~/validations/auth.validation.js'

const router = express.Router()

// ========== PUBLIC ROUTES (không cần authentication) ==========
router.post('/login', loginValidator, loginUser)
router.post('/register', createUserValidator, createUser)
router.post('/refresh-token', refreshTokenValidator, refreshToken)
router.post('/verify-email', verifyEmailValidator, verifyEmail)
router.post('/resend-verify-email', resendEmailVerifyValidator, resendEmailVerify)
router.post('/forgot-password', forgotPasswordValidator, forgotPassword)
router.post('/reset-password', resetPasswordValidator, resetPassword)

router.post('/logout', accessTokenValidator, refreshTokenValidator, logout)
router.post('/logout-all', accessTokenValidator, logoutAll)
router.get('/profile', accessTokenValidator, getProfile)
router.get('/', accessTokenValidator, getUsers)
router.get('/:id', accessTokenValidator, getUser)
router.put('/:id', accessTokenValidator, updateUserValidator, updateUser)
router.delete('/:id', accessTokenValidator, deleteUser)

export default router
