import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { PrismaError } from "prisma-error-enum"

import { BadRequestException } from "@nestjs/common"

import { NameInUseException } from "@agileoffice/core/exception/user/name-in-user.exeption"
import { PhoneNumberInUseException } from "@agileoffice/core/exception/user/phone-number-in-use.exception"
import { UserNotFoundException } from "@agileoffice/core/exception/user/user-not-found.exception"
import { UsernameInUseException } from "@agileoffice/core/exception/user/username-in-use.exception"
import { ExceptionHandler } from "@agileoffice/core/interceptors/handlers/exception.handler"

/** Catches Prisma ORM errors and throws the
 * respective HTTP error
 */
export class PrismaExceptionHandler implements ExceptionHandler {
  /** Catches Prisma ORM errors and throws the
   * respective HTTP error
   */
  handle(error: Error): void {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case PrismaError.UniqueConstraintViolation:
          if (this.isPhoneNumberConstraintViolation(error.meta)) {
            throw new PhoneNumberInUseException()
          }

          if (this.isNameConstraintViolation(error.meta)) {
            throw new NameInUseException()
          }

          if (this.isUsernameConstraintViolation(error.meta)) {
            throw new UsernameInUseException()
          }
          break

        // case PrismaError.ForeignConstraintViolation:
        //   if (this.isPurchaseError(error)) {
        //     throw new ProductNotFoundException();
        //   }
        //   break;

        case PrismaError.RecordsNotFound:
          if (this.isUserError(error)) {
            throw new UserNotFoundException()
          }
          break

        default:
          console.log(error)
          throw new BadRequestException(error.message)
      }
    }

    if (this.isPrismaUnknownError(error)) {
      console.log(error)
      throw new BadRequestException(error.message)
    }
  }

  /** Checks if the error contains clientVersion,
   * making it an unknown prisma error
   * */
  private isPrismaUnknownError(error): boolean {
    return !!error.clientVersion
  }

  /** Returns wether the error happened in the email field or not */
  private isPhoneNumberConstraintViolation(errorMeta: object): boolean {
    return Object.values(errorMeta)[0][0] === "phoneNumber"
  }

  /** Returns wether the error happened in the name field or not */
  private isNameConstraintViolation(errorMeta: object): boolean {
    return Object.values(errorMeta)[0][0] === "name"
  }

  /** Returns wether the error happened in the username field or not */
  private isUsernameConstraintViolation(errorMeta: object): boolean {
    return Object.values(errorMeta)[0][0] === "userName"
  }

  /** Returns wether the error happened on an user prisma query or not */
  private isUserError(error: PrismaClientKnownRequestError): boolean {
    return error.message.includes("prisma.user")
  }
}
