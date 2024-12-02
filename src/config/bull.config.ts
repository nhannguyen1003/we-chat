import { BullModule } from "@nestjs/bullmq"
import { ConfigModule, ConfigService } from "@nestjs/config"

export const BullConfig = BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    connection: {
      host: configService.get("REDIS_HOST"),
      port: configService.get("REDIS_PORT")
    }
  }),
  inject: [ConfigService]
})
