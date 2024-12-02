import { MessageStatus } from "@prisma/client"
import { IsEnum } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

export class UpdateMessageStatusDto {
  @ApiProperty({
    description: "New status of the message",
    enum: MessageStatus
  })
  @IsEnum(MessageStatus)
  status: MessageStatus
}
