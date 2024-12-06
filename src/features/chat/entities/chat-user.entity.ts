import { User } from "@agileoffice/features/user/entities"

export class ChatUserEntity {
  id: number
  chatId: number
  userId: number
  role: string
  user: User
  createdAt: Date
  updatedAt: Date
}
