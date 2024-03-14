import { Module } from '@nestjs/common';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Priceitem])],
  controllers: [CsvController],
  providers: [CsvService],
  exports: [CsvService],
})
export class CsvModule {}
