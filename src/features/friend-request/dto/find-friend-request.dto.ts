import { RequestStatus } from "@prisma/client"
import { IsOptional, IsInt, IsEnum } from "class-validator"

import { ApiPropertyOptional } from "@nestjs/swagger"

export class FindFriendRequestDto {
  @ApiPropertyOptional({
    description: "Filter by status",
    enum: RequestStatus
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus

  @ApiPropertyOptional({
    description: "Filter by user ID"
  })
  @IsOptional()
  @IsInt()
  userId?: number
}
