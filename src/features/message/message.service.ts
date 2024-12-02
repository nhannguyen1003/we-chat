// src/features/message/message.service.ts
import { MessageStatus } from "@prisma/client"

import { Injectable, ForbiddenException } from "@nestjs/common"

import { PrismaService } from "../../prisma/prisma.service"
import { MediaService } from "../media/media.service"
import { CreateMessageDto } from "./dto/create-message.dto"
import { FindMessageDto } from "./dto/find-message.dto"
import { MessageEntity } from "./entities/message.entity"
import { MessageNotFoundException } from "./exceptions/message.exception"

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService
  ) {}

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

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        chatId,
        fromUserId: userId,
        content,
        type: type || "text"
      },
      include: {
        media: true,
        fromUser: true
      }
    })

    // Upload and associate media if provided
    if (media && media.length > 0) {
      for (const mediaItem of media) {
        await this.mediaService.uploadMedia(userId, {
          ...mediaItem,
          messageId: message.id // Associate with the newly created message
        })
      }
    }

    // Return the message with associated media
    const fullMessage = await this.prisma.message.findUnique({
      where: { id: message.id },
      include: {
        media: true,
        fromUser: true
      }
    })

    return fullMessage as unknown as MessageEntity
  }

  async findMessages(userId: number, findMessageDto: FindMessageDto): Promise<MessageEntity[]> {
    const { id, chatId, type } = findMessageDto

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {}

    if (id) {
      whereClause.id = id
    }

    if (chatId) {
      // Verify user is part of the chat
      const chatUser = await this.prisma.chatUser.findFirst({
        where: {
          chatId,
          userId
        }
      })

      if (!chatUser) {
        throw new ForbiddenException("You are not a member of this chat")
      }

      whereClause.chatId = chatId
    }

    if (type) {
      whereClause.type = type
    }

    const messages = await this.prisma.message.findMany({
      where: whereClause,
      include: {
        media: true,
        fromUser: true
      }
    })

    return messages as unknown as MessageEntity[]
  }

  async updateMessageStatus(
    id: number,
    userId: number,
    status: MessageStatus
  ): Promise<MessageEntity> {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: { fromUser: true }
    })

    if (!message) {
      throw new MessageNotFoundException(id)
    }

    if (message.fromUserId !== userId) {
      throw new ForbiddenException("You can only update your own messages")
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id },
      data: { status },
      include: {
        media: true,
        fromUser: true
      }
    })

    return updatedMessage as unknown as MessageEntity
  }
}
