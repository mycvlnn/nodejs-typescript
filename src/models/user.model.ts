import { MongoConnection } from '~/config/mongo-connection.js'

export interface IUser {
  _id?: string
  name: string
  email: string
  phoneNumber: string
  gender?: string
  createdAt?: Date
  updatedAt?: Date
}

export const getUserCollection = () => {
  const db = MongoConnection.getDB()
  return db.collection<IUser>('users')
}
