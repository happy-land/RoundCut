import { Test, TestingModule } from '@nestjs/testing';
import { PriceitemsService } from './priceitems.service';

describe('PriceitemsService', () => {
  let service: PriceitemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceitemsService],
    }).compile();

    service = module.get<PriceitemsService>(PriceitemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
