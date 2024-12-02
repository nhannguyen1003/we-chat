import { ApiProperty } from "@nestjs/swagger"

export class OtpResponseDto {
  @ApiProperty({
    description: "Status of the OTP request",
    example: "OTP sent successfully"
  })
  status: string
}
