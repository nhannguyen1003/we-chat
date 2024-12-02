// src/features/friend-request/dto/update-friend-request.dto.ts
import { RequestStatus } from "@prisma/client"
import { IsEnum } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

export class UpdateFriendRequestDto {
  @ApiProperty({
    description: "New status of the friend request",
    enum: RequestStatus
  })
  @IsEnum(RequestStatus)
  status: RequestStatus
}
