import { IsOptional, IsNumber } from "class-validator"

import { ApiPropertyOptional } from "@nestjs/swagger"

export class FindChatDto {
  @ApiPropertyOptional({
    description: "ID of the chat to find"
  })
  @IsOptional()
  @IsNumber()
  id?: number
}
