import { BadRequestException } from "@nestjs/common"

/** Throws HTTP status 404. Used when the permission id
 * cannot be found in the system
 */
export class UserNotVerifiedException extends BadRequestException {
  /** Throws HTTP status 404 with message
   * 'Permission not found'. Used when the permission id
   * cannot be found in the system
   */
  constructor() {
    super("This account has not verified! Please contact your administrator for more information")
  }
}
