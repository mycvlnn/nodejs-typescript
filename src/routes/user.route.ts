import express from 'express'
import { createUser, getUsers, loginUser } from '~/controllers/user.controller.js'
import { loginValidator } from '~/middlewares/auth.middleware.js'

const router = express.Router()
router.post('/login', loginValidator, loginUser)
router.get('/', getUsers)
router.post('/', createUser)

export default router
