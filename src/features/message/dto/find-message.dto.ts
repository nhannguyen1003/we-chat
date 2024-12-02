import { IsOptional, IsInt, IsString } from "class-validator"

import { ApiPropertyOptional } from "@nestjs/swagger"

export class FindMessageDto {
  @ApiPropertyOptional({
    description: "ID of the message to find"
  })
  @IsOptional()
  @IsInt()
  id?: number

  @ApiPropertyOptional({
    description: "ID of the chat to find messages in"
  })
  @IsOptional()
  @IsInt()
  chatId?: number

  @ApiPropertyOptional({
    description: "Type of the message"
  })
  @IsOptional()
  @IsString()
  type?: string
}
