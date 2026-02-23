import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { TransportType } from 'libs/common';

@InputType()
export class LocationInput {
  @Field()
  @IsString()
  userId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  speed: number;

  @Field()
  @IsDateString()
  timestamp: string;

  @Field(() => TransportType)
  @IsEnum(TransportType)
  transportType: TransportType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;
}
