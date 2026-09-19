import { Module } from '@nestjs/common';
import { PriceitemsService } from './priceitems.service';
import { PriceitemsController } from './priceitems.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priceitem } from './entities/priceitem.entity';
import { WarehousesModule } from 'src/warehouses/warehouses.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { Cutitem } from 'src/cutitems/entities/cutitem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Priceitem, Cutitem]),
    WarehousesModule,
    CategoriesModule,
  ],
  controllers: [PriceitemsController],
  providers: [PriceitemsService],
  exports: [PriceitemsService],
})
export class PriceitemsModule {}
