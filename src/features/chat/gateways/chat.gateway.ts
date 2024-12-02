/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from "socket.io"

import { ForbiddenException, Logger, UseGuards } from "@nestjs/common"
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
} from "@nestjs/websockets"

import { WsJwtGuard } from "@agileoffice/core/guard/ws-jwt.guard"

import { CreateMessageDto } from "../../message/dto/create-message.dto"
import { ChatService } from "../chat.service"

@WebSocketGateway({
  cors: {
    origin: "*" // Adjust as needed
  }
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  private logger: Logger = new Logger("ChatGateway")

  constructor(private readonly chatService: ChatService) {}

  afterInit() {
    this.logger.log("WebSocket Initialized")
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect() {
    this.logger.log("A client disconnected")
  }

  @SubscribeMessage("joinChat")
  async handleJoinChat(@MessageBody() data: { chatId: number }, @ConnectedSocket() client: Socket) {
    const { chatId } = data
    client.join(`chat_${chatId}`)
    this.logger.log(`Client ${client.id} joined chat_${chatId}`)
    return { status: "joined", chatId }
  }

  @SubscribeMessage("leaveChat")
  async handleLeaveChat(
    @MessageBody() data: { chatId: number },
    @ConnectedSocket() client: Socket
  ) {
    const { chatId } = data
    client.leave(`chat_${chatId}`)
    this.logger.log(`Client ${client.id} left chat_${chatId}`)
    return { status: "left", chatId }
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    // Extract userId from the authenticated socket
    const user = (client as any).user
    if (!user || !user.id) {
      throw new ForbiddenException("User not authenticated")
    }
    const userId = user.id

    // Call the ChatService's sendMessage with both userId and data
    const message = await this.chatService.sendMessage(userId, data)

    // Emit the new message to all users in the chat room
    this.server.to(`chat_${data.chatId}`).emit("newMessage", message)

    return message
  }
}
