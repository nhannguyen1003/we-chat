import { Controller, Post, Get, Patch, Body, Param, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from "@nestjs/swagger"

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

  @ApiOperation({ summary: "Find messages" })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findMessages(
    @GetCurrentUserId() userId: number,
    @Body() findMessageDto: FindMessageDto
  ): Promise<MessageEntity[]> {
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
