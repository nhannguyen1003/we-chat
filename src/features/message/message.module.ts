// src/features/message/message.module.ts
import { Module } from "@nestjs/common"

import { PrismaModule } from "../../prisma/prisma.module"
import { MediaModule } from "../media/media.module"
import { UserModule } from "../user/user.module"
import { MessageController } from "./message.controller"
import { MessageService } from "./message.service"

@Module({
  imports: [PrismaModule, MediaModule, UserModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}
