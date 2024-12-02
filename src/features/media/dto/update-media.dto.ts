// src/features/media/dto/update-media.dto.ts
import { MediaType } from "@prisma/client"
import { IsEnum, IsOptional, IsString, IsUrl } from "class-validator"

import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateMediaDto {
  @ApiPropertyOptional({
    description: "New type of the media"
  })
  @IsOptional()
  @IsString()
  @IsEnum(MediaType)
  type?: MediaType

  @ApiPropertyOptional({
    description: "New URL of the media file"
  })
  @IsOptional()
  @IsUrl()
  url?: string
}
