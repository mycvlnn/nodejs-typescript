import { Request, Response } from 'express'
import { User } from '~/models/user.model.js'

export const loginUser = (req: Request, res: Response) => {
  const { email, password } = req.body
  // Here you would typically check the email and password against your database
  if (email === 'animous@gmail.com' && password === '123456') {
    // Simulate a successful login
    res.status(200).json({ message: 'Login successful', user: { email } })
  } else {
    // Simulate a failed login
    res.status(401).json({ message: 'Invalid email or password' })
  }
}

export const getUsers = async (_req: Request, res: Response) => {
  // const users = await User.find()
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'join@gmail.com'
    }
  ]

  res.json(users)
}

export const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body
  const user = new User({ name, email })
  await user.save()
  res.status(201).json(user)
}
