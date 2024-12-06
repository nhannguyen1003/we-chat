import { ChatStatus, ChatType } from "@prisma/client"

import { MessageEntity } from "../../message/entities/message.entity"
import { ChatUserEntity } from "./chat-user.entity"

export class ChatEntity {
  id: number
  type: ChatType
  status: ChatStatus
  name?: string
  users: ChatUserEntity[]
  messages: MessageEntity[]
  createdAt: Date
  updatedAt: Date
}
