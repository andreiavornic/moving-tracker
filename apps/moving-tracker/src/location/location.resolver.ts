import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { LocationService } from './location.service';
import { LocationInput } from './location.input';

@Resolver()
export class LocationResolver {
  constructor(private readonly locationService: LocationService) {}

  @Mutation(() => Boolean, {
    description: 'Set the location',
  })
  async addLocation(@Args('input') input: LocationInput): Promise<boolean> {
    return this.locationService.sendLocation(input);
  }
}
