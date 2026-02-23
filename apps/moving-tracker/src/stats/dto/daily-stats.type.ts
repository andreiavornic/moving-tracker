import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class DailyStats {
  @Field(() => Float)
  totalDistanceKm: number;

  @Field(() => Float)
  averageSpeed: number;

  @Field(() => Float)
  movingTimeMinutes: number;

  @Field(() => Float)
  stoppedTimeMinutes: number;

  @Field(() => Int)
  totalEvents: number;
}
