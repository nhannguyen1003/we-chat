// src/auth/dto/update-user.dto.ts
import { IsNotEmpty, IsOptional, IsString, Matches, IsUrl } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

export class UpdateUserDto {
  @ApiProperty({ required: false, example: "Jane" })
  @IsString()
  @IsOptional()
  firstName?: string

  @ApiProperty({ required: false, example: "Smith" })
  @IsString()
  @IsOptional()
  lastName?: string

  @ApiProperty({
    description: "User's phone number",
    example: "+1234567890"
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9*#+ ]+$/, {
    message: "Not a valid phone number"
  })
  phoneNumber: string

  @ApiProperty({
    required: false,
    description: "URL of the avatar image",
    example: "https://example.com/avatar.jpg"
  })
  @IsOptional()
  @IsUrl({}, { message: "Avatar must be a valid URL" })
  avatarUrl?: string

  @ApiProperty({
    required: false,
    description: ""
  })
  @IsOptional()
  gender?: string
}
