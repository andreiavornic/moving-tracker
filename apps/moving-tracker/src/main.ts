import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Move Tracker')
    .setDescription('Moving-Driven Tracker')
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .addTag('metrics', 'Application metrics')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = process.env.PORT || 3000;

  await app.listen(port);
  logger.log(`API running on port ${port}`);
  logger.log(`GraphQL Playground: http://localhost:${port}/graphql`);
  logger.log(`Swagger UI: http://localhost:${port}/api/docs`);
}
bootstrap();
