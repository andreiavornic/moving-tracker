import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from 'libs/database/entities';
import { LOCATION_QUEUE } from 'libs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationEntity]),
    BullModule.registerQueue({ name: LOCATION_QUEUE }),
  ],
  providers: [MetricsService],
  controllers: [MetricsController]
})
export class MetricsModule {}
