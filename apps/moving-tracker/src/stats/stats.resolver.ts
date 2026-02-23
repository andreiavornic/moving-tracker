import { Args, Query, Resolver } from '@nestjs/graphql';
import { DailyStats } from './dto/daily-stats.type';
import { Trip } from './dto/trip.type';
import { StatsService } from './stats.service';

@Resolver()
export class StatsResolver {
  constructor(private readonly statsService: StatsService) {}

  @Query(() => DailyStats, {
    description: 'Get daily mobility statistics for a user',
  })
  async getDailyStats(
    @Args('userId') userId: string,
    @Args('date', { description: 'Data in format YYYY-MM-DD' }) date: string,
  ): Promise<DailyStats> {
    return this.statsService.getDailyStats(userId, date);
  }

  @Query(() => [Trip], {
    description: 'Get trip segments for a user on a specific date',
  })
  async getTrips(
    @Args('userId') userId: string,
    @Args('date', { description: 'Data in format YYYY-MM-DD' }) date: string,
  ): Promise<Trip[]> {
    return this.statsService.getTrips(userId, date);
  }
}
