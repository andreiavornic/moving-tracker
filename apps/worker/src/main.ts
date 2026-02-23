import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('WorkerBootstrap');
  const app = await NestFactory.create(WorkerModule);
  logger.log('Worker started - listening for location processing jobs');
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received - shutting down worker');
    await app.close();
    process.exit(0);
  });
  return logger;
}
bootstrap().then((logger: Logger) => {
  logger.log('Server WORKER is running!');
});
