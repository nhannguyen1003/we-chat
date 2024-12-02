import { BadRequestException } from "@nestjs/common"

export class InvalidOtpException extends BadRequestException {
  constructor() {
    super("Invalid OTP provided")
  }
}

export class OtpExpiredException extends BadRequestException {
  constructor() {
    super("OTP has expired")
  }
}

export class MaxOtpAttemptsExceededException extends BadRequestException {
  constructor() {
    super("Maximum OTP verification attempts exceeded")
  }
}
