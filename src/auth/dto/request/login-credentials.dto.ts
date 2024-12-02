import { IsNotEmpty, IsString } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

/** Describes the information needed to authenticate an User to the application */
export class LoginCredentialsDto {
  /**
   * User email
   * @example "admin@invincix.com"
   */
  @ApiProperty({
    description: "User phone number",
    example: "+1234567890"
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string

  /**
   * User password
   * @example "12345678"
   */
  @ApiProperty({
    description: "User password",
    example: "12345678"
  })
  @IsNotEmpty()
  @IsString()
  password: string
}
