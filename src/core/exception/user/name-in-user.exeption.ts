import { BadRequestException } from "@nestjs/common"

/** Throws HTTP status 400. Used when the user inputs
 * an email that is already registered in the system
 */
export class NameInUseException extends BadRequestException {
  /** Throws HTTP status 400 with message
   * 'Name already in use'. Used when the user inputs
   * a name that is already registered in the system
   */
  constructor() {
    super("Name already in use")
  }
}
