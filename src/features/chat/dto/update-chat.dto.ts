import { ChatType } from "@prisma/client"
import { IsOptional, IsString, IsEnum, IsArray, ArrayUnique, ArrayNotEmpty } from "class-validator"

import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateChatDto {
  @ApiPropertyOptional({
    description: "New type of the chat",
    enum: ChatType
  })
  @IsOptional()
  @IsEnum(ChatType)
  type?: ChatType

  @ApiPropertyOptional({
    description: "New name of the chat"
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({
    description: "List of user IDs to add to the chat",
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  addUserIds?: number[]

  @ApiPropertyOptional({
    description: "List of user IDs to remove from the chat",
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  removeUserIds?: number[]
}
