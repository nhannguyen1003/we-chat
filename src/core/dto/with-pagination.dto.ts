import { ApiProperty } from "@nestjs/swagger"

export class WithPagination<T> {
  @ApiProperty({
    example: 100
  })
  pagination: {
    total: number
  }

  data: T
}
