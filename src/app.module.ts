// src/app.module.ts
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { EventEmitterModule } from "@nestjs/event-emitter"

import { AuthModule } from "./auth/auth.module"
import { AccessJwtAuthGuard } from "./core/guard/access-jwt-auth.guard"
import { ChatModule } from "./features/chat/chat.module"
import { FriendRequestModule } from "./features/friend-request/friend-request.module"
import { MediaModule } from "./features/media/media.module"
import { MessageModule } from "./features/message/message.module"
import { UserModule } from "./features/user/user.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UserModule,
    ChatModule,
    MediaModule,
    MessageModule,
    FriendRequestModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessJwtAuthGuard
    }
  ]
})
export class AppModule {}
