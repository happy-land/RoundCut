import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemesService } from './schemes.service';
import { SchemesController } from './schemes.controller';
import { Scheme } from './entities/scheme.entity';
import { SchemeItem } from './entities/scheme-item.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scheme, SchemeItem, Order, Priceitem])],
  controllers: [SchemesController],
  providers: [SchemesService],
})
export class SchemesModule {}

