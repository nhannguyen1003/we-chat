/** Decrypted Refresh JsonWebToken content */
export type RefreshTokenPayload = {
  /** Token subject, user ID used
   * @example "1"
   */
  id: number

  /** Token family for refresh token rotation
   *
   * Check https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
   * @example "f0e25bbd-ea56-4c0f-9341-30c0270a1d78"
   */
  phoneNumber: string

  family?: string
}
