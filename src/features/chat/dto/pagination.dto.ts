import { Type } from "class-transformer"
import { IsOptional, IsInt, IsPositive } from "class-validator"

import { ApiPropertyOptional } from "@nestjs/swagger"

export class PaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: "Page number - default is 1"
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1

  @ApiPropertyOptional({
    example: 10,
    description: "Page size - default is 10"
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 20
}
