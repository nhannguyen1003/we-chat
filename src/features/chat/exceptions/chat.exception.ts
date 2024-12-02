import { HttpException, HttpStatus } from "@nestjs/common"

export class ChatNotFoundException extends HttpException {
  constructor(chatId: number) {
    super(`Chat with ID ${chatId} not found`, HttpStatus.NOT_FOUND)
  }
}

export class UserAlreadyInChatException extends HttpException {
  constructor(userId: number, chatId: number) {
    super(`User with ID ${userId} is already in chat ${chatId}`, HttpStatus.BAD_REQUEST)
  }
}

export class UserNotInChatException extends HttpException {
  constructor(userId: number, chatId: number) {
    super(`User with ID ${userId} is not in chat ${chatId}`, HttpStatus.BAD_REQUEST)
  }
}
