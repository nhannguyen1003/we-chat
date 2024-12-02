import { HttpException, HttpStatus } from "@nestjs/common"

export class FriendRequestNotFoundException extends HttpException {
  constructor(requestId: number) {
    super(`Friend request with ID ${requestId} not found`, HttpStatus.NOT_FOUND)
  }
}

export class FriendRequestAlreadyExistsException extends HttpException {
  constructor(fromUserId: number, toUserId: number) {
    super(
      `Friend request from user ${fromUserId} to user ${toUserId} already exists`,
      HttpStatus.BAD_REQUEST
    )
  }
}

export class InvalidFriendRequestStatusException extends HttpException {
  constructor(status: string) {
    super(`Invalid friend request status: ${status}`, HttpStatus.BAD_REQUEST)
  }
}
