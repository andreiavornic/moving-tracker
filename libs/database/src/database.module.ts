import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocationEntity } from 'libs/database/entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'movingtracker'),
        password: configService.get<string>('DB_PASSWORD', 'movingtracker_secret'),
        database: configService.get<string>('DB_DATABASE', 'movingtracker'),
        entities: [LocationEntity],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature(),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
