import { ChatType } from "@prisma/client"
import { IsEnum, IsOptional, IsString, IsArray, ArrayNotEmpty, ArrayUnique } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

export class CreateChatDto {
  @ApiProperty({
    description: "Type of the chat",
    enum: ChatType,
    default: ChatType.DUAL
  })
  @IsEnum(ChatType)
  type: ChatType

  @ApiProperty({
    description: "Name of the group chat",
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    description: "List of user IDs to be added to the chat",
    type: [Number]
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  userIds: number[]
}
