import { BadRequestException, UnauthorizedException } from "@nestjs/common"

import { AuthServiceInputException } from "@agileoffice/auth/exceptions/auth-service-input.exception"

import { ExceptionHandler } from "./exception.handler"

/** Catches user input errors and throws the
 * respective HTTP error
 */
export class UserInputExceptionHandler implements ExceptionHandler {
  /** Catches user input errors and throws the
   * respective HTTP error
   */
  handle(error: Error): void {
    if (error instanceof AuthServiceInputException) {
      throw new UnauthorizedException(error.message)
    }

    // if (error instanceof UserServiceInputException) {
    //   throw new BadRequestException(error.message);
    // }
  }
}
