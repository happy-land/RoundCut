import { Module } from '@nestjs/common';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';
import { WarehousesModule } from 'src/warehouses/warehouses.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Priceitem]),
    WarehousesModule,
    CategoriesModule,
  ],
  controllers: [CsvController],
  providers: [CsvService],
  exports: [CsvService],
})
export class CsvModule {}
