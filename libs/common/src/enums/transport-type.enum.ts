import { registerEnumType } from '@nestjs/graphql';

export enum TransportType {
  CAR = 'CAR',
  WALK = 'WALK',
}

registerEnumType(TransportType, {
  name: 'TransportType',
  description: 'Type of transport used',
});
