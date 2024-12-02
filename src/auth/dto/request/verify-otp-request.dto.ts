import { IsString, IsNotEmpty, IsPhoneNumber } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

export class VerifyOtpRequestDto {
  @ApiProperty({
    description: "Phone number of the user",
    example: "+1234567890"
  })
  @IsPhoneNumber(null)
  @IsNotEmpty()
  phoneNumber: string

  @ApiProperty({
    description: "OTP code sent to the user",
    example: "123456"
  })
  @IsString()
  @IsNotEmpty()
  otp: string
}
