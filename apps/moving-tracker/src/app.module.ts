import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { DatabaseModule } from 'libs/database';
import { RedisModule } from 'libs/redis';
import { QueueModule } from 'libs/queue';
import { LocationModule } from './location/location.module';
import { StatsModule } from './stats/stats.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
    }),
    DatabaseModule,
    RedisModule,
    QueueModule,
    LocationModule,
    StatsModule,
    HealthModule,
    MetricsModule,
  ],
})
export class AppModule {}
