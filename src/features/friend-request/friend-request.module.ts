// src/features/friend-request/friend-request.module.ts
import { Module } from "@nestjs/common"

import { PrismaModule } from "../../prisma/prisma.module"
import { UserModule } from "../user/user.module"
import { FriendRequestController } from "./friend-request.controller"
import { FriendRequestService } from "./friend-request.service"

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [FriendRequestController],
  providers: [FriendRequestService],
  exports: [FriendRequestService]
})
export class FriendRequestModule {}
