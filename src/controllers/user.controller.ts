import { Request, Response } from 'express'
import { User } from '~/models/user.model.js'

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
