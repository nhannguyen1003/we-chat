import { Server, Socket } from "socket.io"

import { Injectable, Logger } from "@nestjs/common"
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket
} from "@nestjs/websockets"

import { PrismaService } from "@agileoffice/prisma"

@WebSocketGateway({
  cors: {
    origin: "*" // Cho phép kết nối từ mọi nguồn (cấu hình thêm nếu cần)
  }
})
@Injectable()
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  private readonly logger = new Logger(UserGateway.name)

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const userId = this.extractUserIdFromToken(client)

    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: "ONLINE" }
      })

      this.logger.log(`User ${userId} is now ONLINE`)
      this.broadcastUserStatus(userId, "ONLINE")
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = this.extractUserIdFromToken(client)

    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: "OFFLINE" }
      })

      this.logger.log(`User ${userId} is now OFFLINE`)
      this.broadcastUserStatus(userId, "OFFLINE")
    }
  }

  private extractUserIdFromToken(client: Socket): number | null {
    try {
      const token = client.handshake.headers.authorization?.split(" ")[1]
      const payload = this.decodeToken(token)
      return payload?.id || null
    } catch (error) {
      this.logger.error("Failed to extract user ID from token", error)
      return null
    }
  }

  private decodeToken(token: string): { id: number } | null {
    // Decode logic here (use JWT service if available)
    try {
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
      return payload
    } catch {
      return null
    }
  }

  private broadcastUserStatus(userId: number, status: string) {
    this.server.emit("userStatusChange", { userId, status })
  }
}
