// src/features/friend-request/friend-request.service.ts
import { RequestStatus } from "@prisma/client"
import { ChatStatus } from "@prisma/client"

import { Injectable, ForbiddenException } from "@nestjs/common"

import { PrismaService } from "../../prisma/prisma.service"
import { CreateFriendRequestDto } from "./dto/create-friend-request.dto"
import { FindFriendRequestDto } from "./dto/find-friend-request.dto"
import { UpdateFriendRequestDto } from "./dto/update-friend-request.dto"
import { FriendRequestEntity } from "./entities/friend-request.entity"
import {
  FriendRequestNotFoundException,
  FriendRequestAlreadyExistsException,
  InvalidFriendRequestStatusException
} from "./exceptions/friend-request.exception"

// Import ChatStatus enum

@Injectable()
export class FriendRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async sendFriendRequest(
    fromUserId: number,
    createFriendRequestDto: CreateFriendRequestDto
  ): Promise<FriendRequestEntity> {
    const { toUserId } = createFriendRequestDto

    if (fromUserId === toUserId) {
      throw new ForbiddenException("You cannot send a friend request to yourself")
    }

    // Check if a friend request already exists
    const existingRequest = await this.prisma.friendRequest.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId
        }
      }
    })

    if (existingRequest) {
      throw new FriendRequestAlreadyExistsException(fromUserId, toUserId)
    }

    const friendRequest = await this.prisma.friendRequest.create({
      data: {
        fromUserId,
        toUserId
      },
      include: {
        fromUser: true,
        toUser: true
      }
    })

    return friendRequest as unknown as FriendRequestEntity
  }

  async findFriendRequests(
    userId: number,
    findFriendRequestDto: FindFriendRequestDto
  ): Promise<FriendRequestEntity[]> {
    const { status } = findFriendRequestDto

    const friendRequests = await this.prisma.friendRequest.findMany({
      where: {
        toUserId: userId,
        ...(status && { status })
      },
      include: {
        fromUser: true,
        toUser: true
      }
    })

    return friendRequests as unknown as FriendRequestEntity[]
  }

  async updateFriendRequest(
    id: number,
    userId: number,
    updateFriendRequestDto: UpdateFriendRequestDto
  ): Promise<FriendRequestEntity> {
    const { status } = updateFriendRequestDto

    if (!Object.values(RequestStatus).includes(status)) {
      throw new InvalidFriendRequestStatusException(status)
    }

    const friendRequest = await this.prisma.friendRequest.findUnique({
      where: { id },
      include: {
        fromUser: true,
        toUser: true
      }
    })

    if (!friendRequest) {
      throw new FriendRequestNotFoundException(id)
    }

    if (friendRequest.toUserId !== userId) {
      throw new ForbiddenException("You are not authorized to update this friend request")
    }

    if (friendRequest.status !== RequestStatus.PENDING) {
      throw new ForbiddenException("Only pending friend requests can be updated")
    }

    const updatedFriendRequest = await this.prisma.friendRequest.update({
      where: { id },
      data: { status },
      include: {
        fromUser: true,
        toUser: true
      }
    })

    // If accepted, update related chats' status to IN_CHAT
    if (status === RequestStatus.ACCEPTED) {
      await this.updateChatsStatusToInChat(friendRequest.fromUserId, friendRequest.toUserId)
    }

    return updatedFriendRequest as unknown as FriendRequestEntity
  }

  /**
   * Updates the status of chats between two users to IN_CHAT.
   *
   * @param userAId - ID of the first user
   * @param userBId - ID of the second user
   */
  private async updateChatsStatusToInChat(userAId: number, userBId: number) {
    // Find chats that include both users and are currently WAITING
    const chats = await this.prisma.chat.findMany({
      where: {
        type: "DUAL",
        status: "WAITING",
        users: {
          every: {
            userId: {
              in: [userAId, userBId]
            }
          }
        }
      },
      include: {
        users: true
      }
    })

    for (const chat of chats) {
      // Ensure that both users are part of the chat
      const userIds = chat.users.map((cu) => cu.userId)
      if (userIds.includes(userAId) && userIds.includes(userBId)) {
        await this.prisma.chat.update({
          where: { id: chat.id },
          data: { status: "IN_CHAT" }
        })
      }
    }
  }
}
