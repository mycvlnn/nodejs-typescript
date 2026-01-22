import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/user.route.js'
import { errorMiddleware } from '~/middlewares/error.middleware.js'

dotenv.config()

const app = express()

// ========== MIDDLEWARES ==========
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ========== ROUTES ==========
app.use('/api/users', userRoutes)

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// ========== ERROR HANDLING MIDDLEWARE (phải đặt cuối cùng) ==========
app.use(errorMiddleware as any)

export default app
