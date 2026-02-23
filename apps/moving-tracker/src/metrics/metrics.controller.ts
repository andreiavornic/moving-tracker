import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { MetricsResponse } from './dto/metrics-response.dto';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Get application metrics' })
  @ApiResponse({
    status: 200,
    description: 'Application metrics',
    type: MetricsResponse,
  })
  async getMetrics(): Promise<MetricsResponse> {
    return this.metricsService.getMetrics();
  }
}
