import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

export class UpdateUserPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "Password must have length of at least 8" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[a-z]).*$/, {
    message: "Password must contain at least 1 number and 1 letter"
  })
  password: string
}
