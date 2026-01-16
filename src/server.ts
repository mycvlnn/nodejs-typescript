import { MongoConnection } from './config/mongo-connection.js'
import { envConfig } from './config/env-config.js'
import app from './index.js'

const start = async () => {
  try {
    await MongoConnection.connect()
    app.listen(envConfig.port, () => {
      console.log(`🚀 Server running at http://localhost:${envConfig.port}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
  }
}

start()

interface User {
  id: number
  name: string
  email: string
  fullname?: string
}

const user: User = {
  id: 1,
  name: 'JohnDoe',
  email: 'lengoaingu@gmail.com',
  fullname: ''
}

console.log(user)

class UserEntity {
  id: number
  name: string

  constructor(id: number, name: string) {
    this.name = name
    this.id = id
  }

  getDisplayName(): string {
    return `${this.id} - ${this.name}`
  }
}

const ngu = new UserEntity(1, 'Nguyen Van A')
console.log(ngu.getDisplayName())
