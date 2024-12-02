import { MessageStatus } from "@prisma/client"

import { User } from "@agileoffice/features/user/entities"

import { ChatEntity } from "../../chat/entities/chat.entity"
import { MediaEntity } from "../../media/entities/media.entity"

export class MessageEntity {
  id: number
  type: string
  content: string
  chatId: number
  fromUserId: number
  status: MessageStatus
  chat: ChatEntity
  fromUser: User
  media: MediaEntity[]
  createdAt: Date
  updatedAt: Date
}
