// src/features/friend-request/entities/friend-request.entity.ts
import { RequestStatus } from "@prisma/client"

import { User } from "../../user/entities/user.entity"

export class FriendRequestEntity {
  id: number
  fromUserId: number
  toUserId: number
  status: RequestStatus
  fromUser: User
  toUser: User
  createdAt: Date
  updatedAt: Date
}
