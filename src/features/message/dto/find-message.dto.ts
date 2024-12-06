// src/features/message/dto/find-message.dto.ts
import { IsOptional, IsInt, IsString, Min } from "class-validator"

import { ApiPropertyOptional } from "@nestjs/swagger"

export class FindMessageDto {
  @ApiPropertyOptional({
    description: "ID of the chat to find messages in",
    example: 1
  })
  @IsOptional()
  @IsInt()
  chatId?: number

  @ApiPropertyOptional({
    description: "Type of the message",
    example: "text"
  })
  @IsOptional()
  @IsString()
  type?: string

  @ApiPropertyOptional({
    description: "Search query to find messages containing this text",
    example: "hello"
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: "Page number for pagination (starting from 1)",
    example: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: "page must not be less than 1" })
  page?: number = 1

  @ApiPropertyOptional({
    description: "Number of messages per page",
    example: 20
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: "limit must not be less than 1" })
  limit?: number = 20
}
