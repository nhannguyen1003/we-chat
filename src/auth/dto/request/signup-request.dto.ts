import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

export class SignUpRequestDto {
  @ApiProperty({
    example: "0944464225"
  })
  @IsNotEmpty()
  @Matches(/^[0-9*#+ ]+$/, {
    message: "Not a valid phone number"
  })
  phoneNumber: string

  @ApiProperty({
    example: "12345678"
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "Password must have length of at least 8" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/, {
    message: "Password must contain at least 1 number and 1 letter"
  })
  password: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  gender: string
}
