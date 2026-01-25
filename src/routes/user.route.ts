import express from 'express'
import { loginUser, getUsers, getUser, createUser, updateUser, deleteUser } from '~/controllers/user.controller.js'
import { createUserValidator, loginValidator, updateUserValidator } from '~/validations/user.validation.js'

const router = express.Router()

// Auth routes
router.post('/login', loginValidator, loginUser)

// User CRUD routes
router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', createUserValidator, createUser)
router.put('/:id', updateUserValidator, updateUser)
router.delete('/:id', deleteUser)

export default router
