import { Module } from '@nestjs/common';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';
import { WarehousesModule } from 'src/warehouses/warehouses.module';
import { CategoriesRepository } from 'src/categories.repository/categories.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Priceitem]), WarehousesModule],
  controllers: [CsvController],
  providers: [CsvService, CategoriesRepository],
  exports: [CsvService],
})
export class CsvModule {}
