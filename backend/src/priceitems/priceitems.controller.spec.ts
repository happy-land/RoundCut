import { Test, TestingModule } from '@nestjs/testing';
import { PriceitemsController } from './priceitems.controller';
import { PriceitemsService } from './priceitems.service';

describe('PriceitemsController', () => {
  let controller: PriceitemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceitemsController],
      providers: [PriceitemsService],
    }).compile();

    controller = module.get<PriceitemsController>(PriceitemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
