import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Trip {
  @Field(() => String)
  startTime: string;

  @Field(() => String)
  endTime: string;

  @Field(() => Float)
  distanceKm: number;

  @Field(() => Float)
  avgSpeed: number;
}
