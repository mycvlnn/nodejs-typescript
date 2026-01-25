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
import { authMiddleware } from '~/middlewares/auth.middleware.js'

const router = express.Router()

// ========== PUBLIC ROUTES (không cần authentication) ==========
router.post('/login', loginValidator, loginUser)
router.post('/register', createUserValidator, createUser)
router.post('/refresh-token', refreshToken)

// ========== PROTECTED ROUTES (cần authentication) ==========
router.use(authMiddleware) // Apply auth middleware to all routes below

router.post('/logout', logout)
router.post('/logout-all', logoutAll)
router.get('/profile', getProfile)
router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', updateUserValidator, updateUser)
router.delete('/:id', deleteUser)

export default router
