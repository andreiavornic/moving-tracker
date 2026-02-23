import { Module } from '@nestjs/common';
import { LocationProcessorService } from './location-processor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from 'libs/database/entities';
import { BullModule } from '@nestjs/bullmq';
import { LOCATION_QUEUE } from 'libs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationEntity]),
    BullModule.registerQueue({ name: LOCATION_QUEUE }),
  ],
  providers: [LocationProcessorService],
})
export class LocationProcessorModule {}
