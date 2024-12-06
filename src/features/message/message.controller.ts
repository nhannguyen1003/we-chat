// src/features/message/message.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query, // Import Query decorator
  HttpCode,
  HttpStatus
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiQuery } from "@nestjs/swagger"

import { GetCurrentUserId } from "@agileoffice/core/decorator/get-current-user-id.decorator"

import { CreateMessageDto } from "./dto/create-message.dto"
import { FindMessageDto } from "./dto/find-message.dto"
import { UpdateMessageStatusDto } from "./dto/update-message-status.dto"
import { MessageEntity } from "./entities/message.entity"
import { MessageService } from "./message.service"

@ApiTags("Message")
@ApiBearerAuth()
@Controller("message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: "Send a message" })
  @ApiBody({ type: CreateMessageDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @GetCurrentUserId() userId: number
  ): Promise<MessageEntity> {
    return this.messageService.sendMessage(userId, createMessageDto)
  }

  @ApiOperation({ summary: "Find messages with search and pagination" })
  @ApiQuery({
    name: "chatId",
    required: false,
    type: Number,
    description: "ID of the chat to find messages in",
    example: 1
  })
  @ApiQuery({
    name: "type",
    required: false,
    type: String,
    description: "Type of the message",
    example: "text"
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search query to find messages containing this text",
    example: "hello"
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number for pagination (starting from 1)",
    example: 1
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of messages per page",
    example: 20
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findMessages(
    @GetCurrentUserId() userId: number,
    @Query() findMessageDto: FindMessageDto // Use @Query() instead of @Body()
  ): Promise<{ messages: MessageEntity[]; total: number }> {
    // Update return type
    return this.messageService.findMessages(userId, findMessageDto)
  }

  @ApiOperation({ summary: "Update message status" })
  @ApiBody({ type: UpdateMessageStatusDto })
  @Patch(":id/status")
  @HttpCode(HttpStatus.OK)
  async updateMessageStatus(
    @Param("id") id: number,
    @Body() updateMessageStatusDto: UpdateMessageStatusDto,
    @GetCurrentUserId() userId: number
  ): Promise<MessageEntity> {
    return this.messageService.updateMessageStatus(id, userId, updateMessageStatusDto.status)
  }
}
