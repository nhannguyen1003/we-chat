import { PrismaClient } from "@prisma/client"

import {
  createFindManyAndCountExtension,
  type FindManyAndCount
} from "./extensions/find-many-count.extension"

type ModelsWithExtensions = {
  [Model in keyof PrismaClient]: PrismaClient[Model] extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findMany: (args: infer TArgs) => Promise<any>
  }
    ? {
        findManyAndCount: FindManyAndCount<PrismaClient[Model], TArgs>
      } & PrismaClient[Model]
    : PrismaClient[Model]
}

class UntypedExtendedClient extends PrismaClient {
  constructor(options?: ConstructorParameters<typeof PrismaClient>[0]) {
    super(options)

    return this.$extends(createFindManyAndCountExtension(this)) as this
  }
}

const ExtendedPrismaClient = UntypedExtendedClient as unknown as new (
  options?: ConstructorParameters<typeof PrismaClient>[0]
) => PrismaClient & ModelsWithExtensions

export { ExtendedPrismaClient }
