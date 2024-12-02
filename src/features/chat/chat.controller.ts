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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiParam } from "@nestjs/swagger"

import { GetCurrentUserId } from "@agileoffice/core/decorator/get-current-user-id.decorator"

import { ChatService } from "./chat.service"
import { CreateChatDto } from "./dto/create-chat.dto"
import { FindChatDto } from "./dto/find-chat.dto"
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

  @ApiOperation({ summary: "Find chats" })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findChats(
    @GetCurrentUserId() userId: number,
    @Query() query: { id?: string }
  ): Promise<ChatEntity[]> {
    const findChatDto: FindChatDto = {
      id: query.id ? parseInt(query.id, 10) : undefined
    }
    return this.chatService.findChats(userId, findChatDto)
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
