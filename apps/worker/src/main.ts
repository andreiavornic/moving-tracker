import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  const app = await NestFactory.createApplicationContext(WorkerModule);
  logger.log('Worker started — listening for location processing jobs');

  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received — shutting down worker');
    await app.close();
    process.exit(0);
  });
}
bootstrap();
