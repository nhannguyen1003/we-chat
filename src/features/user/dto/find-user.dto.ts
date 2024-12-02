import { IsOptional, IsString } from "class-validator"

import { ApiProperty } from "@nestjs/swagger"

/** Describes the information to search for categories */
export class FindUsersDto {
  /** String containing in category name
   * case insensitive
   * @example "apparel"
   */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string
}
