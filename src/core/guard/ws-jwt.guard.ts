// src/features/auth/guards/ws-jwt.guard.ts
import { Socket } from "socket.io"

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>()
    const token = client.handshake.auth.token

    if (!token) {
      throw new UnauthorizedException("No token provided")
    }

    try {
      const payload = this.jwtService.verify(token)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(client as any).user = payload // Attach user info to the client
      return true
    } catch (err) {
      throw new UnauthorizedException("Invalid token")
    }
  }
}
