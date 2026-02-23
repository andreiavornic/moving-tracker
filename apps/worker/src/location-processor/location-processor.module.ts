import { Module } from '@nestjs/common';
import { LocationProcessorService } from './location-processor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from 'libs/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity])],
  providers: [LocationProcessorService],
})
export class LocationProcessorModule {}
