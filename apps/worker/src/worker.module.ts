import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'libs/database';
import { RedisModule } from 'libs/redis';
import { QueueModule } from 'libs/queue';
import { LocationProcessorModule } from './location-processor/location-processor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.docker', '.env'],
    }),
    DatabaseModule,
    RedisModule,
    QueueModule,
    LocationProcessorModule
  ],

})
export class WorkerModule {}
