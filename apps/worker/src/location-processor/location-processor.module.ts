import { Module } from '@nestjs/common';
import { LocationProcessorService } from './location-processor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from 'libs/database/entities';
import { QueueModule } from 'libs/queue';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationEntity]),
    QueueModule,
  ],
  providers: [LocationProcessorService],
})
export class LocationProcessorModule {}
