import { Request, Response } from 'express'
import { getUserCollection, IUser } from '~/models/user.model.js'

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
  try {
    const userCollection = getUserCollection()
    const users = await userCollection.find().toArray()
    res.json(users)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Error fetching users', error: error.message })
  }
}

export const createUser = async (req: Request, res: Response) => {
  const { name, email, phoneNumber, gender } = req.body
  console.log({ reqBody: req.body })

  const user: IUser = {
    name,
    email,
    phoneNumber,
    gender,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  try {
    const userCollection = getUserCollection()
    const result = await userCollection.insertOne(user)
    console.log('User created:', result)
    res.status(201).json({ ...user, _id: result.insertedId })
  } catch (error: any) {
    console.error('Error creating user:', error)
    res.status(400).json({ message: 'Error creating user', error: error.message })
  }
}
