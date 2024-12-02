import { Prisma } from "@prisma/client"
import type { PrismaClient } from "@prisma/client"

export function createFindManyAndCountExtension<TModel = any, TArgs = any>(prisma: PrismaClient) {
  return {
    name: "findManyAndCount",
    model: {
      $allModels: {
        findManyAndCount<T extends Prisma.Args<TModel, "findMany">>(
          this: TModel,
          args?: Prisma.Exact<T, Prisma.Args<TModel, "findMany">>
        ): Promise<[Prisma.Result<TModel, T, "findMany">, number]> {
          const context = Prisma.getExtensionContext(this)

          return prisma.$transaction([
            (context as any).findMany(args),
            (context as any).count({ where: (args as any)?.where })
          ])
        }
      }
    }
  }
}

export type FindManyAndCount<TModel, TArgs> = ReturnType<
  typeof createFindManyAndCountExtension<TModel, TArgs>
>["model"]["$allModels"]["findManyAndCount"]
