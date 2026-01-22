import express from 'express'
import { loginUser, getUsers, getUser, createUser, updateUser, deleteUser } from '~/controllers/user.controller.js'
import { validateLogin, validateCreateUser, validateUpdateUser } from '~/validations/user.validation.js'

const router = express.Router()

// Auth routes
router.post('/login', validateLogin, loginUser)

// User CRUD routes
router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', validateCreateUser, createUser)
router.put('/:id', validateUpdateUser, updateUser)
router.delete('/:id', deleteUser)

export default router
