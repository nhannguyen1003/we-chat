import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"

import { ExtendedPrismaClient } from "./extended-client"

@Injectable()
export class PrismaService extends ExtendedPrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
