import ms, { StringValue } from "ms"

import { refreshJwtConfig } from "@agileoffice/config/jwt.config"

/** Returns the token expiration date */
export function getTokenExpirationDate(expiresIn: string | number): Date {
  const expiresInDays = ms(refreshJwtConfig.expiresIn as StringValue) / 1000 / 60 / 60 / 24

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const expiresAt = addDaysFromNow(expiresInDays)

  return expiresAt
}

/** Add amount of days from today's date */
function addDaysFromNow(days: number): Date {
  const result = new Date()
  result.setDate(result.getDate() + days)
  return result
}
