import { BadRequestException } from "@nestjs/common"

/** Throws HTTP status 400. Used when the user inputs
 * an email that is already registered in the system
 */
export class UsernameInUseException extends BadRequestException {
  /** Throws HTTP status 400 with message
   * 'E-mail already in use'. Used when the user inputs
   * an email that is already registered in the system
   */
  constructor() {
    super("Username already in use")
  }
}
