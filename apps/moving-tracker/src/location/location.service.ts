import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationEntity } from 'libs/database/entities';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { LOCATION_JOB, LOCATION_QUEUE } from 'libs/common';
import { Queue } from 'bullmq';
import { LocationInput } from './location.input';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,

    @InjectQueue(LOCATION_QUEUE)
    private readonly locationQueue: Queue,
  ) {}

  async sendLocation(input: LocationInput): Promise<boolean> {
    const timestamp = new Date(input.timestamp);
    const date = timestamp.toISOString().split('T')[0];
    try {
      const { userId, latitude, longitude, speed, transportType, accuracy } =
        input;
      const result = await this.locationRepo
        .createQueryBuilder()
        .insert()
        .into(LocationEntity)
        .values({
          userId,
          latitude,
          longitude,
          speed,
          timestamp,
          date,
          transportType,
          accuracy: accuracy ?? null,
          isMoving: false,
          processed: false,
        })
        .orIgnore() // Skip daca (userId + timestamp)
        .execute();

      if (result.raw.length === 0 || !result.identifiers[0]?.id) {
        this.logger.debug(
          `Duplicat location ignored: userId=${input.userId}, timestamp=${input.timestamp}`,
        );
        return true;
      }

      const locationId = result.identifiers[0].id;

      await this.locationQueue.add(
        LOCATION_JOB,
        { locationId, userId: input.userId, timestamp: input.timestamp },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      );
      this.logger.debug(
        `Location Added: locationId=${input.userId}, timestamp=${input.timestamp}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to process location event: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return false;
    }
  }
}
