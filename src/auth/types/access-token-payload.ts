/** Decrypted Access JsonWebToken content */
// export type AccessTokenPayload = {
//   /** Token subject, user ID used
//    * @example "1"
//    */
//   sub: number;

//   /** User permissions
//    * @example "vendor.create.staff"
//    */
//   userPermissions: string[];

//   /** User type
//    * @example "SYSTEM" | "VENDOR" | "HOTEL"
//    */
//   type: UserType;
// };

export type AccessTokenPayload = {
  /** Token subject, user ID used
   * @example "1"
   */
  id: number
  phoneNumber: string
  family?: string
}
