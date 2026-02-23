import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly clientRedis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    this.clientRedis = new Redis({
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      maxRetriesPerRequest: null,
    });
    this.clientRedis.on('error', (err) => {
      this.logger.error(err);
    });
  }
  getClientRedis(): Redis {
    return this.clientRedis;
  }

  async get(key: string): Promise<string | null> {
    return this.clientRedis.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.clientRedis.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.clientRedis.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.clientRedis.del(key);
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.clientRedis.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.clientRedis.quit(() =>
      this.logger.log(`Redis module destroyed`),
    );
  }
}
