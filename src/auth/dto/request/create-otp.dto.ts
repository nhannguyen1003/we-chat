import { IsNotEmpty, IsPhoneNumber } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

export class OtpRequestDto {
  @ApiProperty({
    description: "Phone number of the user",
    example: "+1234567890"
  })
  @IsPhoneNumber(null)
  @IsNotEmpty()
  phoneNumber: string
}
