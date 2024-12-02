/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, ForbiddenException, Logger } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"

import { PrismaService } from "../../prisma/prisma.service"
import { CreateMessageDto } from "../message/dto/create-message.dto"
import { MessageEntity } from "../message/entities/message.entity"
import { UserService } from "../user/user.service"
import { CreateChatDto } from "./dto/create-chat.dto"
import { FindChatDto } from "./dto/find-chat.dto"
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Creates a new chat (DUAL or GROUP) with specified users.
   * Ensures the creator is included in the chat.
   *
   * @param createChatDto - DTO containing chat details
   * @param userId - ID of the user creating the chat
   * @returns The created ChatEntity
   */
  async createChat(createChatDto: CreateChatDto, userId: number): Promise<ChatEntity> {
    const { type, name, userIds } = createChatDto

    // Include the creator in the chat
    const uniqueUserIds = Array.from(new Set([...userIds, userId]))

    const chat = await this.prisma.chat.create({
      data: {
        type,
        name: type === "GROUP" ? name : undefined,
        users: {
          create: uniqueUserIds.map((id) => ({
            userId: id
          }))
        }
      },
      include: {
        users: {
          include: {
            user: true // Include user details
          }
        },
        messages: true
      }
    })

    return chat as unknown as ChatEntity
  }

  /**
   * Finds chats for a user. If an ID is provided, fetches that specific chat.
   * Otherwise, retrieves all chats the user is part of.
   *
   * @param userId - ID of the current user
   * @param findChatDto - DTO containing search parameters
   * @returns Array of ChatEntity
   */
  async findChats(userId: number, findChatDto: FindChatDto): Promise<ChatEntity[]> {
    const { id } = findChatDto

    if (id) {
      const chat = await this.prisma.chat.findUnique({
        where: { id },
        include: {
          users: {
            include: {
              user: true
            }
          },
          messages: true
        }
      })

      if (!chat) {
        throw new ChatNotFoundException(id)
      }

      // Check if user is part of the chat
      const isMember = chat.users.some((cu) => cu.userId === userId)
      if (!isMember) {
        throw new ForbiddenException("You are not a member of this chat")
      }

      return [chat as unknown as ChatEntity]
    }

    // Fetch all chats the user is part of
    const chats = await this.prisma.chat.findMany({
      where: {
        users: {
          some: {
            userId
          }
        }
      },
      include: {
        users: {
          include: {
            user: true
          }
        },
        messages: true
      }
    })

    return chats as unknown as ChatEntity[]
  }

  /**
   * Updates chat details, including adding or removing users.
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

    const updatedChat = await this.prisma.chat.update({
      where: { id },
      data: {
        type: updateChatDto.type,
        name: updateChatDto.name
      },
      include: {
        users: {
          include: {
            user: true
          }
        },
        messages: true
      }
    })

    return updatedChat as unknown as ChatEntity
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
      include: { users: true }
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

    // Map media to include valid types from MediaType
    const mappedMedia = media?.map((mediaItem) => ({
      type: mediaItem.type, // Use the correct enum value
      url: mediaItem.url,
      userId
    }))

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        chatId,
        fromUserId: userId,
        content,
        type: type || "text",
        media: {
          create: mappedMedia
        }
      },
      include: {
        media: true,
        fromUser: true,
        chat: {
          include: {
            users: {
              include: {
                user: true
              }
            },
            messages: true
          }
        }
      }
    })

    // Handle delivery based on friendship
    for (const _recipientId of friendsRecipients) {
      const updatedMessage = await this.prisma.message.update({
        where: { id: message.id },
        data: {
          status: "DELIVERED"
        },
        include: {
          media: true,
          fromUser: true,
          chat: {
            include: {
              users: {
                include: {
                  user: true
                }
              },
              messages: true
            }
          }
        }
      })

      await this.emitMessageToChat(chatId, updatedMessage as unknown as MessageEntity)
    }

    for (const _recipientId of strangersRecipients) {
      await this.prisma.message.update({
        where: { id: message.id },
        data: {
          status: "PENDING"
        }
      })
    }

    return message as unknown as MessageEntity
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
}
