import { Test, TestingModule } from '@nestjs/testing';
import { LocationProcessorService } from './location-processor.service';

describe('LocationProcessorService', () => {
  let service: LocationProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationProcessorService],
    }).compile();

    service = module.get<LocationProcessorService>(LocationProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
