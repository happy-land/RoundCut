import { Module } from '@nestjs/common';
import { PriceitemsService } from './priceitems.service';
import { PriceitemsController } from './priceitems.controller';

@Module({
  controllers: [PriceitemsController],
  providers: [PriceitemsService],
})
export class PriceitemsModule {}
