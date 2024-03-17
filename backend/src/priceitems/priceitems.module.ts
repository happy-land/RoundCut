import { Module } from '@nestjs/common';
import { PriceitemsService } from './priceitems.service';
import { PriceitemsController } from './priceitems.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priceitem } from './entities/priceitem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Priceitem])],
  controllers: [PriceitemsController],
  providers: [PriceitemsService],
  exports: [PriceitemsService],
})
export class PriceitemsModule {}
