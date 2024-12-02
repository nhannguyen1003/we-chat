import { IsJWT } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

/** Describes the information needed to logout an User of the application */
export class LogoutRequestDto {
  @ApiProperty({
    description: "User refresh token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  })
  @IsJWT()
  refreshToken: string
}
