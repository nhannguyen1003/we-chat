// src/features/media/exceptions/media.exception.ts
import { HttpException, HttpStatus } from "@nestjs/common"

export class MediaNotFoundException extends HttpException {
  constructor(mediaId: number) {
    super(`Media with ID ${mediaId} not found`, HttpStatus.NOT_FOUND)
  }
}
