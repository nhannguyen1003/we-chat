// src/features/user/user.module.ts
import { PrismaService } from "src/prisma/prisma.service"

import { Module } from "@nestjs/common"

import { UserController } from "./user.controller"
import { UserService } from "./user.service"

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService]
})
export class UserModule {}
