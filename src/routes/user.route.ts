import express from 'express'
import { loginUser, getUsers, getUser, createUser, updateUser, deleteUser } from '~/controllers/user.controller.js'
import { validate } from '~/middlewares/validate.middleware.js'
import { createUserValidator, loginValidator, updateUserValidator } from '~/validations/user.validation.js'

const router = express.Router()

// Auth routes
router.post('/login', loginValidator, validate, loginUser)

// User CRUD routes
router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', createUserValidator, validate, createUser)
router.put('/:id', updateUserValidator, validate, updateUser)
router.delete('/:id', deleteUser)

export default router
