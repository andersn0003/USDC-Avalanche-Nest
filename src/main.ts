import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
// import { ServerlessAdapter } from '@nestjs/platform-serverless'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Avalanche USDC Transfer Analyzer API')
    .setDescription(
      'API for analyzing and aggregating USDC transfer data on the Avalanche blockchain',
    )
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT ?? 3000)
  // return app.getHttpAdapter().getInstance()
}
bootstrap()
