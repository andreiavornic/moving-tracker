import { ApiProperty } from '@nestjs/swagger';

export class QueueMetrics {
  @ApiProperty({ description: 'Jobs waiting in queue', example: 2 })
  waiting: number;

  @ApiProperty({ description: 'Jobs currently being processed', example: 1 })
  active: number;

  @ApiProperty({ description: 'Jobs that failed processing', example: 0 })
  failed: number;
}

export class MetricsResponse {
  @ApiProperty({ description: 'Total location events in database', example: 1250 })
  totalEvents: number;

  @ApiProperty({ description: 'Events processed by worker', example: 1248 })
  processedEvents: number;

  @ApiProperty({ description: 'Events waiting to be processed', example: 2 })
  pendingEvents: number;

  @ApiProperty({ description: 'Unique users who sent data today', example: 5 })
  activeUsersToday: number;

  @ApiProperty({ description: 'BullMQ queue statistics', type: QueueMetrics })
  queue: QueueMetrics;

  @ApiProperty({ description: 'Service uptime', example: '2h 15m 30s' })
  uptime: string;
}
