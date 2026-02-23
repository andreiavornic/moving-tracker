import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationEntity } from 'libs/database/entities';
import { LessThan, Repository } from 'typeorm';
import { RedisService } from 'libs/redis';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { haversineDistance, isMoving, LOCATION_QUEUE } from 'libs/common';
import { Job } from 'bullmq';

interface LocationJobData {
  locationId: string;
  userId: string;
  timestamp: string;
}

@Processor(LOCATION_QUEUE)
export class LocationProcessorService extends WorkerHost {
  private readonly logger = new Logger(LocationProcessorService.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async process(job: Job<LocationJobData>): Promise<void> {
    const { locationId, userId, timestamp } = job.data;
    this.logger.log(
      `Processing location id=${locationId} with userId=${userId}`,
    );
    const location = await this.locationRepo.findOne({
      where: { id: locationId },
    });

    if (!location) {
      this.logger.warn(`Could not find location with id ${locationId}`);
      return;
    }

    if (location.processed) {
      this.logger.debug(`Location already processed: ${locationId}`);
      return;
    }

    let distanceFromPrev: number | null = null;

    const prevLocation = await this.locationRepo.findOne({
      where: { userId, timestamp: LessThan(location.timestamp) },
      order: { timestamp: 'DESC' },
    });
    if (prevLocation) {
      distanceFromPrev = haversineDistance(
        prevLocation.latitude,
        prevLocation.longitude,
        prevLocation.latitude,
        prevLocation.longitude,
      );
    }
    const moving = isMoving(location.speed);

    await this.locationRepo.update(locationId, {
      distanceFromPrev,
      isMoving: moving,
      processed: true,
    });

    const date = location.date;
    await this.redisService.del(`stats:daily:${userId}:${date}`);
    await this.redisService.del(`stats:trips:${userId}:${date}`);

    this.logger.debug(
      `Processed location: id=${locationId}, distance=${distanceFromPrev?.toFixed(3)}km, moving=${moving}`,
    );
  }
}
