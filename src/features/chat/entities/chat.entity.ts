import { ChatType } from "@prisma/client"

import { MessageEntity } from "../../message/entities/message.entity"
import { ChatUserEntity } from "./chat-user.entity"

export class ChatEntity {
  id: number
  type: ChatType
  name?: string
  users: ChatUserEntity[]
  messages: MessageEntity[]
  createdAt: Date
  updatedAt: Date
}
