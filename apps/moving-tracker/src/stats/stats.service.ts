import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'libs/redis';
import { Repository } from 'typeorm';
import { LocationEntity } from 'libs/database/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyStats } from './dto/daily-stats.type';
import { TRIP_GAP_SECOND } from 'libs/common';
import { Trip } from './dto/trip.type';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  private readonly cacheTtl: number;

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.cacheTtl = this.config.get<number>('STATS_CACHE_TTL', 300);
  }

  async getDailyStats(userId: string, date: string): Promise<DailyStats> {
    const cacheKey = `stats:daily:${userId}:${date}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug('Daily stats: ', cacheKey);
      return JSON.parse(cached);
    }
    const locations = await this.locationRepo.find({
      where: { userId, date, processed: true },
      order: { timestamp: 'ASC' },
    });

    const totalEvents = locations.length;

    if (totalEvents === 0) {
      return {
        totalDistanceKm: 0,
        averageSpeed: 0,
        movingTimeMinutes: 0,
        stoppedTimeMinutes: 0,
        totalEvents: 0,
      };
    }
    let totalDistanceKm = 0;
    let movingTimeSeconds = 0;
    let stoppedTimeSeconds = 0;
    let totalSpeed = 0;
    for (let i = 0; i < locations.length; ++i) {
      totalSpeed += locations[i].speed;

      if (locations[i].distanceFromPrev !== null) {
        totalDistanceKm += locations[i].distanceFromPrev!;
      }
      if (i > 0) {
        const timeDiff =
          (locations[i].timestamp.getTime() -
            locations[i - 1].timestamp.getTime()) /
          1000;
        if (timeDiff < TRIP_GAP_SECOND) {
          if (locations[i].isMoving) {
            movingTimeSeconds += timeDiff;
          } else {
            stoppedTimeSeconds += timeDiff;
          }
        }
      }
    }

    const stats: DailyStats = {
      totalDistanceKm: Math.round(totalDistanceKm * 1000) / 1000,
      averageSpeed: Math.round((totalSpeed / totalEvents) * 100) / 100,
      movingTimeMinutes: Math.round((movingTimeSeconds / 60) * 100) / 100,
      stoppedTimeMinutes: Math.round((stoppedTimeSeconds / 60) * 100) / 100,
      totalEvents,
    };
    await this.redis.set(cacheKey, JSON.stringify(stats), this.cacheTtl);
    this.logger.debug(`Cached daily stats: ${cacheKey}`);

    return stats;
  }

  async getTrips(userId: string, date: string): Promise<Trip[]> {
    const cacheKey = `stats:trips:${userId}:${date}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for trips: ${cacheKey}`);
      return JSON.parse(cached);
    }
    const locations = await this.locationRepo.find({
      where: { userId, date, processed: true },
      order: { timestamp: 'ASC' },
    });
    const trips: Trip[] = [];

    if (locations.length === 0) {
      return trips;
    }

    let tripStart: LocationEntity | null = null;
    let tripDistance = 0;
    let tripSpeedSum = 0;
    let tripPointCount = 0;
    let prevLocation: LocationEntity | null = null;

    for (const loc of locations) {
      if (loc.isMoving) {
        if (!tripStart) {
          tripStart = loc;
          tripDistance = 0;
          tripSpeedSum = 0;
          tripPointCount = 0;
        }

        if (
          prevLocation &&
          (loc.timestamp.getTime() - prevLocation.timestamp.getTime()) / 1000 >
          TRIP_GAP_SECOND
        ) {
          // Gap too large — end current trip and start new one
          if (tripStart && tripPointCount > 0) {
            trips.push({
              startTime: tripStart.timestamp.toISOString(),
              endTime: prevLocation.timestamp.toISOString(),
              distanceKm: Math.round(tripDistance * 1000) / 1000,
              avgSpeed:
                Math.round((tripSpeedSum / tripPointCount) * 100) / 100,
            });
          }
          tripStart = loc;
          tripDistance = 0;
          tripSpeedSum = 0;
          tripPointCount = 0;
        }

        if (loc.distanceFromPrev !== null) {
          tripDistance += loc.distanceFromPrev;
        }
        tripSpeedSum += loc.speed;
        tripPointCount++;
      } else {
        // User stopped — finalize current trip
        if (tripStart && tripPointCount > 0) {
          trips.push({
            startTime: tripStart.timestamp.toISOString(),
            endTime: (prevLocation?.timestamp ?? loc.timestamp).toISOString(),
            distanceKm: Math.round(tripDistance * 1000) / 1000,
            avgSpeed: Math.round((tripSpeedSum / tripPointCount) * 100) / 100,
          });
        }
        tripStart = null;
        tripDistance = 0;
        tripSpeedSum = 0;
        tripPointCount = 0;
      }

      prevLocation = loc;
    }

    // Final toate trip deschise
    if (tripStart && tripPointCount > 0 && prevLocation) {
      trips.push({
        startTime: tripStart.timestamp.toISOString(),
        endTime: prevLocation.timestamp.toISOString(),
        distanceKm: Math.round(tripDistance * 1000) / 1000,
        avgSpeed: Math.round((tripSpeedSum / tripPointCount) * 100) / 100,
      });
    }

    await this.redis.set(cacheKey, JSON.stringify(trips), this.cacheTtl);
    this.logger.debug(`Cached trips: ${cacheKey}`);

    return trips;
  }
}
