import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MetricsResponse } from './dto/metrics-response.dto';
import { LocationEntity } from 'libs/database/entities';
import { LOCATION_QUEUE } from 'libs/common';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: Repository<LocationEntity>,
    @InjectQueue(LOCATION_QUEUE)
    private readonly locationQueue: Queue,
  ) {}

  async getMetrics(): Promise<MetricsResponse> {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalEvents,
      processedEvents,
      activeUsersToday,
      queueWaiting,
      queueActive,
      queueFailed,
    ] = await Promise.all([
      this.locationRepo.count(),
      this.locationRepo.count({ where: { processed: true } }),
      this.locationRepo
        .createQueryBuilder('loc')
        .select('COUNT(DISTINCT loc.user_id)', 'count')
        .where('loc.date = :today', { today })
        .getRawOne()
        .then((r) => parseInt(r?.count ?? '0', 10)),
      this.locationQueue.getWaitingCount(),
      this.locationQueue.getActiveCount(),
      this.locationQueue.getFailedCount(),
    ]);

    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    return {
      totalEvents,
      processedEvents,
      pendingEvents: totalEvents - processedEvents,
      activeUsersToday,
      queue: {
        waiting: queueWaiting,
        active: queueActive,
        failed: queueFailed,
      },
      uptime,
    };
  }
}
