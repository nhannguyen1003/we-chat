// src/features/chat/chat.module.ts
import { Module } from "@nestjs/common"

import { AuthModule } from "@agileoffice/auth/auth.module"

import { PrismaModule } from "../../prisma/prisma.module"
import { MessageModule } from "../message/message.module"
import { UserModule } from "../user/user.module"
import { ChatController } from "./chat.controller"
import { ChatService } from "./chat.service"
import { ChatGateway } from "./gateways/chat.gateway"

@Module({
  imports: [PrismaModule, MessageModule, UserModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService]
})
export class ChatModule {}
