import * as cookieParser from "cookie-parser"
import "dotenv/config"

import { Logger, ValidationPipe } from "@nestjs/common"
import { HttpAdapterHost, NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

import { AppModule } from "./app.module"
import { AllExceptionsFilter } from "./core/exception/global.exception"
import { ExceptionInterceptor } from "./core/interceptors/exception.interceptor"
import { ResponseInterceptor } from "./core/interceptors/response.interceptor"

/** Starts the application */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    credentials: true,
    origin: true
  })

  app.use(cookieParser())

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  const { httpAdapter } = app.get(HttpAdapterHost)

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))

  app.useGlobalInterceptors(new ExceptionInterceptor())

  app.useGlobalInterceptors(new ResponseInterceptor())

  const config = new DocumentBuilder()
    .setTitle("Chat app Back End")
    .setDescription("Back End for Chat app")
    .setVersion("0.0.1")
    .addBearerAuth()
    .build()

  const globalPrefix = "api/v1"
  app.setGlobalPrefix(globalPrefix)

  const document = SwaggerModule.createDocument(app, config)
  const swaggerPrefix = "openApi"
  SwaggerModule.setup(swaggerPrefix, app, document, {
    customSiteTitle: "Chat app Swagger API",
    useGlobalPrefix: true
  })

  const port = process.env.PORT || 3001
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`)
  Logger.log(`🚀 Swagger is running on: http://localhost:${port}/${globalPrefix}/${swaggerPrefix}`)
}
bootstrap()
