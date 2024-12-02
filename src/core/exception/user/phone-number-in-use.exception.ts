import { BadRequestException } from "@nestjs/common"

export class PhoneNumberInUseException extends BadRequestException {
  constructor() {
    super("Phone number already in use")
  }
}
