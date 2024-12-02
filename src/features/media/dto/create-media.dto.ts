// src/features/media/dto/create-media.dto.ts
import { MediaType } from "@prisma/client"
import { IsUrl, IsOptional, IsInt, IsEnum } from "class-validator"

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

// Import MediaType from Prisma

export class CreateMediaDto {
  @ApiProperty({
    description: "Type of the media (e.g., image, file, video)",
    enum: MediaType,
    example: "IMAGE"
  })
  @IsEnum(MediaType)
  type: MediaType

  @ApiProperty({
    description: "URL of the media",
    example: "https://example.com/media1.png"
  })
  @IsUrl()
  url: string

  @ApiPropertyOptional({
    description: "ID of the user who uploaded the media",
    example: 1
  })
  @IsOptional()
  @IsInt()
  userId?: number

  @ApiPropertyOptional({
    description: "ID of the message associated with the media",
    example: 42
  })
  @IsOptional()
  @IsInt()
  messageId?: number
}
