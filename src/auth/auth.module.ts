// src/auth/auth.module.ts
import { PrismaService } from "src/prisma/prisma.service"

import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"

import { UserModule } from "@agileoffice/features/user/user.module"

import { UserService } from "../features/user/user.service"
import { AccessJwtStrategy } from "./access-jwt.strategy"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { OtpService } from "./otp/otp.service"
import { TwilioService } from "./otp/twilio.service"

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UserModule,
    ConfigModule // Import ConfigModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    OtpService,
    AccessJwtStrategy,
    UserService,
    ConfigService,
    TwilioService
  ],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
