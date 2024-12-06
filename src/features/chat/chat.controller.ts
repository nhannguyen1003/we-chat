// src/features/chat/chat.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam, ApiQuery } from "@nestjs/swagger"

import { GetCurrentUserId } from "@agileoffice/core/decorator/get-current-user-id.decorator"

import { ChatService } from "./chat.service"
import { CreateChatDto } from "./dto/create-chat.dto"
import { PaginationDto } from "./dto/pagination.dto"
import { UpdateChatDto } from "./dto/update-chat.dto"
import { ChatEntity } from "./entities/chat.entity"

@ApiTags("Chat")
@ApiBearerAuth()
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: "Create a new chat" })
  @ApiBody({ type: CreateChatDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createChat(
    @Body() createChatDto: CreateChatDto,
    @GetCurrentUserId() userId: number
  ): Promise<ChatEntity> {
    return this.chatService.createChat(createChatDto, userId)
  }

  @ApiOperation({
    summary: "Find all chats for a user with pagination"
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
    description: "Number of chats per page",
    example: 20
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findChats(
    @GetCurrentUserId() userId: number,
    @Query() paginationDto: PaginationDto
  ): Promise<ChatEntity[]> {
    return this.chatService.findChats(userId, paginationDto)
  }

  @ApiOperation({
    summary: "Find a specific chat by ID"
  })
  @ApiParam({
    name: "id",
    description: "ID of the chat to find",
    type: Number
  })
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async findOneChat(
    @GetCurrentUserId() userId: number,
    @Param("id") id: number
  ): Promise<ChatEntity> {
    return this.chatService.findOneChat(userId, id)
  }

  @ApiOperation({ summary: "Update a chat" })
  @ApiBody({ type: UpdateChatDto })
  @ApiParam({ name: "id", description: "ID of the chat to update" })
  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  async updateChat(
    @Param("id") id: number,
    @Body() updateChatDto: UpdateChatDto,
    @GetCurrentUserId() userId: number
  ): Promise<ChatEntity> {
    return this.chatService.updateChat(id, updateChatDto, userId)
  }
}
