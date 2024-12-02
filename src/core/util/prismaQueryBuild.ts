import { Prisma } from "@prisma/client"

import { BadRequestException } from "@nestjs/common"

import { PaginationDto } from "../dto/pagination.dto"

type PrismaModel = Prisma.ModelName

type ModelFields<T extends PrismaModel> = keyof Prisma.TypeMap["model"][T]["fields"]

// TODO: Add support for non string search fields
export function prismaQueryBuild<TModel extends PrismaModel>({
  query,
  searchFields,
  defaultOrderBy = "createdDate" as ModelFields<TModel>,
  allowedOrderByFields,
  defaultOrder = "desc"
}: {
  query: PaginationDto
  searchFields: ModelFields<TModel>[]
  defaultOrderBy?: ModelFields<TModel>
  allowedOrderByFields: ModelFields<TModel>[]
  defaultOrder?: "asc" | "desc"
}) {
  const { q, page = 1, pageSize = 10, orderBy = defaultOrderBy, order = defaultOrder } = query
  allowedOrderByFields = [...allowedOrderByFields, defaultOrderBy]

  if (!allowedOrderByFields.includes(orderBy as ModelFields<TModel>)) {
    throw new BadRequestException(
      `Invalid orderBy field. Allowed fields: ${allowedOrderByFields.join(", ")}`
    )
  }

  const queryObject = {
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: {
      [orderBy]: order
    },
    where:
      q && searchFields && searchFields.length > 0
        ? {
            OR: searchFields.map((field) => ({
              [field]: {
                contains: q,
                mode: "insensitive"
              }
            }))
          }
        : {}
  }

  return queryObject
}
