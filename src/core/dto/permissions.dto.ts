import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class PermissionDto {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: "Admin" })
  name: string

  @ApiPropertyOptional({ example: "Administrator role with full access" })
  description?: string

  @ApiProperty({ example: "manage_all" })
  code: string
}
