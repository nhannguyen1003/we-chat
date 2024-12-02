// src/features/media/dto/find-media.dto.ts
import { MediaType } from "@prisma/client"
import { IsOptional, IsInt, IsString, IsEnum } from "class-validator"

import { ApiPropertyOptional } from "@nestjs/swagger"

export class FindMediaDto {
  @ApiPropertyOptional({
    description: "ID of the media to find"
  })
  @IsOptional()
  @IsInt()
  id?: number

  @ApiPropertyOptional({
    description: "Type of the media"
  })
  @IsOptional()
  @IsString()
  @IsEnum(MediaType)
  type?: MediaType
}
