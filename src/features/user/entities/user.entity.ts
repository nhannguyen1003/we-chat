export class User {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  gender: string
  hash: string
  avatar: {
    id: number
    url: string
  }
}
