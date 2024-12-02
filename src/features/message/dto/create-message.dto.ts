import { MediaType } from "@prisma/client"
import { Type } from "class-transformer"
import {
  IsOptional,
  IsString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsEnum,
  IsNumber
} from "class-validator"

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateMediaDto {
  @ApiProperty({
    description: "Type of the media (e.g., image, file)",
    enum: MediaType,
    example: "image"
  })
  @IsEnum(MediaType)
  type: MediaType

  @ApiProperty({
    description: "URL of the media",
    example: "https://example.com/media1.png"
  })
  @IsString()
  url: string
}

export class CreateMessageDto {
  @ApiProperty({
    description: "ID of the chat where the message is sent",
    example: 1
  })
  @IsNumber() // Assuming chatId is a string; change to @IsInt() if it's a number
  chatId: number

  @ApiProperty({
    description: "Content of the message",
    example: "Hello, World!"
  })
  @IsString()
  content: string

  @ApiPropertyOptional({
    description: "Type of the message (e.g., text, media)",
    example: "text"
  })
  @IsOptional()
  @IsString()
  type?: string

  @ApiPropertyOptional({
    description: "Array of media items attached to the message",
    type: [CreateMediaDto]
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media?: CreateMediaDto[]
}
