import express from 'express'
import {
  loginUser,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  refreshToken,
  logout,
  logoutAll,
  getProfile
} from '~/controllers/user.controller.js'
import { createUserValidator, loginValidator, updateUserValidator } from '~/validations/user.validation.js'
// import { authMiddleware } from '~/middlewares/auth.middleware.js'
import { accessTokenValidator, refreshTokenValidator } from '~/validations/auth.validation.js'

const router = express.Router()

// ========== PUBLIC ROUTES (không cần authentication) ==========
router.post('/login', loginValidator, loginUser)
router.post('/register', createUserValidator, createUser)
router.post('/refresh-token', refreshTokenValidator, refreshToken)

router.post('/logout', accessTokenValidator, refreshTokenValidator, logout)
router.post('/logout-all', accessTokenValidator, logoutAll)
router.get('/profile', accessTokenValidator, getProfile)
router.get('/', accessTokenValidator, getUsers)
router.get('/:id', accessTokenValidator, getUser)
router.put('/:id', accessTokenValidator, updateUserValidator, updateUser)
router.delete('/:id', accessTokenValidator, deleteUser)

export default router
