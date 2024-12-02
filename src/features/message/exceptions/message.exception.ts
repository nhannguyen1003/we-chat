import { HttpException, HttpStatus } from "@nestjs/common"

export class MessageNotFoundException extends HttpException {
  constructor(messageId: number) {
    super(`Message with ID ${messageId} not found`, HttpStatus.NOT_FOUND)
  }
}
