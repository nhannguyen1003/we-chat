import { User } from "@agileoffice/features/user/entities"

import { ChatEntity } from "./chat.entity"

export class ChatUserEntity {
  id: number
  chatId: number
  userId: number
  role: string
  user: User
  chat: ChatEntity
  createdAt: Date
  updatedAt: Date
}
