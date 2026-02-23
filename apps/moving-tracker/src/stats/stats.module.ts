import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsResolver } from './stats.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from 'libs/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([LocationEntity])],
  providers: [StatsService, StatsResolver],
})
export class StatsModule {}
