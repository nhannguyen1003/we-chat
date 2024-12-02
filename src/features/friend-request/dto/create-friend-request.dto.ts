import { IsInt } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

export class CreateFriendRequestDto {
  @ApiProperty({
    description: "ID of the user to send the friend request to"
  })
  @IsInt()
  toUserId: number
}
