import { MessageStatus } from "@prisma/client"

import { MediaEntity } from "../../media/entities/media.entity"

export class MessageEntity {
  id: number
  type: string
  content: string
  chatId: number
  fromUserId: number
  status: MessageStatus
  media: MediaEntity[]
  createdAt: Date
  updatedAt: Date
}
