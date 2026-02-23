import { Controller, Get, Res } from '@nestjs/common';
import { RedisService } from 'libs/redis';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoints' })
  @ApiResponse({ status: 200, description: 'Service is health' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async healthCheck() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      async () => {
        const isHealth = await this.redis.isHealthy();
        if (isHealth) {
          return { redis: { status: 'up' } };
        }
        throw new Error('Redis is not available');
      },
    ]);
  }
}
