import { Prisma } from "@prisma/client"
import { Type } from "class-transformer"
import { IsIn, IsInt, IsOptional, IsPositive, IsString } from "class-validator"

import { ApiPropertyOptional } from "@nestjs/swagger"

export class PaginationDto {
  @ApiPropertyOptional({
    example: "",
    description: "Search query"
  })
  @IsOptional()
  @IsString()
  q?: string

  @ApiPropertyOptional({
    example: 1,
    description: "Page number - default is 1"
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number

  @ApiPropertyOptional({
    example: 10,
    description: "Page size - default is 10"
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pageSize?: number

  @ApiPropertyOptional({
    example: "createdDate",
    description: "Order by field - default is createdDate"
  })
  @IsOptional()
  @IsString()
  orderBy?: string

  @ApiPropertyOptional({
    example: "asc",
    description: "Order direction - default is desc",
    enum: ["asc", "desc"]
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: Prisma.SortOrder
}
