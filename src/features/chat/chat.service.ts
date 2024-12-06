/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/chat/chat.service.ts
import { ChatStatus, MessageStatus } from "@prisma/client"

import { Injectable, ForbiddenException, Logger } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"

import { PrismaService } from "../../prisma/prisma.service"
import { CreateMessageDto } from "../message/dto/create-message.dto"
import { MessageEntity } from "../message/entities/message.entity"
import { User } from "../user/entities"
import { UserService } from "../user/user.service"
import { CreateChatDto } from "./dto/create-chat.dto"
import { PaginationDto } from "./dto/pagination.dto"
import { UpdateChatDto } from "./dto/update-chat.dto"
import { ChatEntity } from "./entities/chat.entity"
import {
  ChatNotFoundException,
  UserAlreadyInChatException,
  UserNotInChatException
} from "./exceptions/chat.exception"

@Injectable()
export class ChatService {
  private userStatusMap: Map<number, string> = new Map() // userId -> status
  private readonly logger: Logger = new Logger("ChatService")

  // Define the default avatar
  private readonly DEFAULT_AVATAR = {
    id: 0, // Assuming 0 represents the default avatar
    url: "https://example.com/default-avatar.png" // Replace with your actual default avatar URL
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Assigns a default avatar to the user if none exists.
   *
   * @param user - The user object from Prisma
   * @returns The user object with an assigned avatar
   */
  private assignDefaultAvatar(user: any): User {
    if (!user.avatar) {
      return {
        ...user,
        avatar: this.DEFAULT_AVATAR
      }
    }
    return user
  }

  /**
   * Creates a new chat (DUAL or GROUP) with specified users.
   * Ensures the creator is included in the chat.
   * Sets chat status based on friendship.
   *
   * @param createChatDto - DTO containing chat details
   * @param userId - ID of the user creating the chat
   * @returns The created ChatEntity
   */
  async createChat(createChatDto: CreateChatDto, userId: number): Promise<ChatEntity> {
    const { type, name, userIds } = createChatDto

    // Include the creator in the chat
    const uniqueUserIds = Array.from(new Set([...userIds, userId]))

    // Determine chat status based on friendship
    let status: ChatStatus = "WAITING"

    if (type === "DUAL") {
      const otherUserId = uniqueUserIds.find((id) => id !== userId)
      if (otherUserId) {
        const friends = await this.userService.getFriends(userId)
        const isFriend = friends.some((friend) => friend.id === otherUserId)
        if (isFriend) {
          status = "IN_CHAT"
        }
      }
    } else if (type === "GROUP") {
      // For group chats, default to WAITING. Adjust as needed.
      status = "WAITING"
    }

    const chat = await this.prisma.chat.create({
      data: {
        type,
        name: type === "GROUP" ? name : undefined,
        status, // Set status based on friendship
        users: {
          create: uniqueUserIds.map((id) => ({
            userId: id
          }))
        }
      },
      include: {
        users: {
          include: {
            user: {
              include: {
                avatar: true // Include avatar to satisfy UserEntity
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 20, // Limit messages during creation
          include: {
            fromUser: {
              include: {
                avatar: true // Include avatar to satisfy UserEntity
              }
            },
            media: true
          }
        }
      }
    })

    // Transform Prisma result to ChatEntity
    const transformedChat: ChatEntity = {
      id: chat.id,
      type: chat.type,
      status: chat.status,
      name: chat.name,
      users: chat.users.map((cu) => ({
        id: cu.id,
        chatId: cu.chatId,
        userId: cu.userId,
        role: cu.role,
        user: this.assignDefaultAvatar(cu.user), // Assign default avatar if missing
        createdAt: cu.createdAt,
        updatedAt: cu.updatedAt
      })),
      messages: chat.messages.map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        chatId: msg.chatId,
        fromUserId: msg.fromUserId,
        status: msg.status,

        media: msg.media,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
      })),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }

    return transformedChat
  }

  /**
   * Finds all chats for a user with pagination.
   * Each chat includes the latest 20 messages.
   *
   * @param userId - ID of the user
   * @param paginationDto - DTO containing pagination parameters
   * @returns Array of ChatEntity with paginated messages
   */
  async findChats(userId: number, paginationDto: PaginationDto): Promise<ChatEntity[]> {
    const { page = 1, limit = 20 } = paginationDto
    const skip = (page - 1) * limit

    const chats = await this.prisma.chat.findMany({
      where: {
        users: {
          some: { userId }
        }
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        users: {
          include: {
            user: {
              include: {
                avatar: true // Include avatar to satisfy UserEntity
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 20, // Fetch the latest 20 messages for each chat
          include: {
            fromUser: {
              include: {
                avatar: true // Include avatar to satisfy UserEntity
              }
            },
            media: true
          }
        }
      }
    })

    return chats.map((chat) => ({
      id: chat.id,
      type: chat.type,
      status: chat.status,
      name: chat.name,
      users: chat.users.map((cu) => ({
        id: cu.id,
        chatId: cu.chatId,
        userId: cu.userId,
        role: cu.role,
        user: this.assignDefaultAvatar(cu.user), // Assign default avatar if missing
        createdAt: cu.createdAt,
        updatedAt: cu.updatedAt
      })),
      messages: chat.messages.reverse().map((message) => ({
        id: message.id,
        type: message.type,
        content: message.content,
        chatId: message.chatId,
        fromUserId: message.fromUserId,
        status: chat.status === "IN_CHAT" ? "DELIVERED" : "PENDING", // Set status based on chat status
        media: message.media,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      })) as MessageEntity[],
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }))
  }

  /**
   * Finds a specific chat by ID, including all its messages.
   *
   * @param userId - ID of the user
   * @param chatId - ID of the chat to find
   * @returns The chat with all its messages
   */
  async findOneChat(userId: number, chatId: number): Promise<ChatEntity> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: {
          include: {
            user: {
              include: {
                avatar: true // Include avatar to satisfy UserEntity
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "asc" }, // Fetch all messages in chronological order
          include: {
            fromUser: {
              include: {
                avatar: true // Include avatar to satisfy UserEntity
              }
            },
            media: true
          }
        }
      }
    })

    if (!chat) {
      throw new ChatNotFoundException(chatId)
    }

    const isMember = chat.users.some((cu) => cu.userId === userId)
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this chat")
    }

    return {
      id: chat.id,
      type: chat.type,
      status: chat.status,
      name: chat.name,
      users: chat.users.map((cu) => ({
        id: cu.id,
        chatId: cu.chatId,
        userId: cu.userId,
        role: cu.role,
        user: this.assignDefaultAvatar(cu.user), // Assign default avatar if missing
        createdAt: cu.createdAt,
        updatedAt: cu.updatedAt
      })),
      messages: chat.messages.map((message) => ({
        id: message.id,
        type: message.type,
        content: message.content,
        chatId: message.chatId,
        fromUserId: message.fromUserId,
        status: chat.status === "IN_CHAT" ? "DELIVERED" : "PENDING", // Set status based on chat status
        media: message.media,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      })),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }
  }

  /**
   * Updates chat details, including adding or removing users.
   * If adding a user who is already a friend, set chat status to IN_CHAT.
   *
   * @param id - ID of the chat to update
   * @param updateChatDto - DTO containing update details
   * @param userId - ID of the user performing the update
   * @returns The updated ChatEntity
   */
  async updateChat(id: number, updateChatDto: UpdateChatDto, userId: number): Promise<ChatEntity> {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: { users: true }
    })

    if (!chat) {
      throw new ChatNotFoundException(id)
    }

    // Check if user is part of the chat
    const isMember = chat.users.some((cu) => cu.userId === userId)
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this chat")
    }

    // Handle adding users
    if (updateChatDto.addUserIds) {
      for (const addUserId of updateChatDto.addUserIds) {
        const alreadyInChat = chat.users.some((cu) => cu.userId === addUserId)
        if (alreadyInChat) {
          throw new UserAlreadyInChatException(addUserId, id)
        }
      }

      await this.prisma.chatUser.createMany({
        data: updateChatDto.addUserIds.map((uid) => ({
          chatId: id,
          userId: uid
        })),
        skipDuplicates: true
      })
    }

    // Handle removing users
    if (updateChatDto.removeUserIds) {
      for (const removeUserId of updateChatDto.removeUserIds) {
        const isInChat = chat.users.some((cu) => cu.userId === removeUserId)
        if (!isInChat) {
          throw new UserNotInChatException(removeUserId, id)
        }
      }

      await this.prisma.chatUser.deleteMany({
        where: {
          chatId: id,
          userId: { in: updateChatDto.removeUserIds }
        }
      })
    }

    // After adding/removing users, check if the chat's status should be updated
    const updatedUsers = await this.prisma.chatUser.findMany({
      where: { chatId: id },
      include: {
        user: {
          include: {
            avatar: true // Include avatar to satisfy UserEntity
          }
        }
      }
    })
    const userIds = updatedUsers.map((cu) => cu.userId)

    // Determine if chat should be IN_CHAT
    // For DUAL chats, check if the two users are friends
    // For GROUP chats, you might need a different logic
    let newStatus: ChatStatus = chat.status

    if (chat.type === "DUAL" && userIds.length === 2) {
      const [userAId, userBId] = userIds
      const friends = await this.userService.getFriends(userAId)
      const isFriend = friends.some((friend) => friend.id === userBId)
      if (isFriend) {
        newStatus = "IN_CHAT"
      } else {
        newStatus = "WAITING"
      }
    }

    const updatedChat = await this.prisma.chat.update({
      where: { id },
      data: {
        type: updateChatDto.type,
        name: updateChatDto.name,
        status: newStatus // Update chat status based on friendship
      },
      include: {
        users: {
          include: {
            user: {
              include: {
                avatar: true // Include avatar to satisfy UserEntity
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            fromUser: {
              include: {
                avatar: true // Include avatar to satisfy UserEntity
              }
            },
            media: true
          }
        }
      }
    })

    return {
      id: updatedChat.id,
      type: updatedChat.type,
      status: updatedChat.status,
      name: updatedChat.name,
      users: updatedChat.users.map((cu) => ({
        id: cu.id,
        chatId: cu.chatId,
        userId: cu.userId,
        role: cu.role,
        user: this.assignDefaultAvatar(cu.user), // Assign default avatar if missing
        createdAt: cu.createdAt,
        updatedAt: cu.updatedAt
      })),
      messages: updatedChat.messages.reverse().map((message) => ({
        id: message.id,
        type: message.type,
        content: message.content,
        chatId: message.chatId,
        fromUserId: message.fromUserId,
        status: updatedChat.status === "IN_CHAT" ? "DELIVERED" : "PENDING", // Set status based on chat status
        media: message.media,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      })) as MessageEntity[],
      createdAt: updatedChat.createdAt,
      updatedAt: updatedChat.updatedAt
    }
  }

  /**
   * Sends a message within a chat. Handles media creation and message status
   * based on friendship status.
   *
   * @param userId - ID of the user sending the message
   * @param createMessageDto - DTO containing message details
   * @returns The created MessageEntity
   */
  async sendMessage(userId: number, createMessageDto: CreateMessageDto): Promise<MessageEntity> {
    const { chatId, content, type, media } = createMessageDto

    // Verify that the user is part of the chat
    const chatUser = await this.prisma.chatUser.findFirst({
      where: {
        chatId,
        userId
      }
    })

    if (!chatUser) {
      throw new ForbiddenException("You are not a member of this chat")
    }

    // Determine the recipient(s)
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        users: {
          include: {
            user: {
              include: {
                avatar: true // Include avatar to satisfy UserEntity
              }
            }
          }
        }
      }
    })

    if (!chat) {
      throw new ForbiddenException("Chat not found")
    }

    // Identify recipients
    const recipientUserIds = chat.users.map((cu) => cu.userId).filter((id) => id !== userId)

    // Check friendship status
    const friends = await this.userService.getFriends(userId)
    const friendsSet = new Set(friends.map((f) => f.id))

    // Categorize recipients
    const friendsRecipients = recipientUserIds.filter((id) => friendsSet.has(id))
    const strangersRecipients = recipientUserIds.filter((id) => !friendsSet.has(id))

    // Remove unused variable warning by using 'friendsRecipients'
    // You can implement logic for friendsRecipients if needed
    // For now, it's used to set message status accordingly

    // Map media to include valid types from MediaType
    const mappedMedia = media?.map((mediaItem) => ({
      type: mediaItem.type, // Use the correct enum value
      url: mediaItem.url,
      userId
    }))

    // Create the message with initial status based on chat status
    const initialStatus = chat.status === "IN_CHAT" ? "DELIVERED" : "PENDING"

    const message = await this.prisma.message.create({
      data: {
        chatId,
        fromUserId: userId,
        content,
        type: type || "text",
        status: initialStatus,
        media: {
          create: mappedMedia
        }
      },
      include: {
        media: true,
        fromUser: {
          include: {
            avatar: true // Include avatar to satisfy UserEntity
          }
        },
        chat: {
          include: {
            users: {
              include: {
                user: {
                  include: {
                    avatar: true // Include avatar to satisfy UserEntity
                  }
                }
              }
            },
            messages: true
          }
        }
      }
    })

    // Handle delivery based on friendship
    if (friendsRecipients.length > 0) {
      const updatedMessage = await this.prisma.message.update({
        where: { id: message.id },
        data: {
          status: "DELIVERED"
        },
        include: {
          media: true,
          fromUser: {
            include: {
              avatar: true // Include avatar to satisfy UserEntity
            }
          },
          chat: {
            include: {
              users: {
                include: {
                  user: {
                    include: {
                      avatar: true // Include avatar to satisfy UserEntity
                    }
                  }
                }
              },
              messages: true
            }
          }
        }
      })

      await this.emitMessageToChat(chatId, this.mapPrismaMessageToMessageEntity(updatedMessage))
    }

    if (strangersRecipients.length > 0) {
      await this.prisma.message.update({
        where: { id: message.id },
        data: {
          status: "PENDING"
        }
      })
    }

    return this.mapPrismaMessageToMessageEntity(message)
  }

  /**
   * Emits a message to a specific chat via EventEmitter.
   *
   * @param chatId - ID of the chat
   * @param message - The MessageEntity to emit
   */
  async emitMessageToChat(chatId: number, message: MessageEntity) {
    this.eventEmitter.emit("chat.message", { chatId, message })
    this.logger.log(`Emitted message to chat_${chatId}`)
  }

  /**
   * Sets the user's online status.
   *
   * @param userId - ID of the user
   * @param status - 'ONLINE' or 'OFFLINE'
   */
  setUserStatus(userId: number, status: "ONLINE" | "OFFLINE") {
    this.userStatusMap.set(userId, status)
  }

  /**
   * Retrieves the user's current status.
   *
   * @param userId - ID of the user
   * @returns Status string
   */
  getUserStatus(userId: number): string {
    return this.userStatusMap.get(userId) || "OFFLINE"
  }

  /**
   * Fetches the statuses of all friends of the user.
   *
   * @param userId - ID of the user
   * @returns Array of objects containing friend user IDs and their statuses
   */
  async getFriendsStatuses(userId: number): Promise<{ userId: number; status: string }[]> {
    const friends = await this.userService.getFriends(userId)
    return friends.map((friend) => ({
      userId: friend.id,
      status: this.getUserStatus(friend.id)
    }))
  }

  /**
   * Helper method to map Prisma Message to MessageEntity.
   * Ensures all required properties are present.
   *
   * @param message - Prisma message object
   * @returns MessageEntity
   */
  private mapPrismaMessageToMessageEntity(message: any): MessageEntity {
    return {
      id: message.id,
      type: message.type,
      content: message.content,
      chatId: message.chatId,
      fromUserId: message.fromUserId,
      status: message.status as MessageStatus,
      media: message.media,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    }
  }
}
