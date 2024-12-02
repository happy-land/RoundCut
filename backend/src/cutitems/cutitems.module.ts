import { Module } from '@nestjs/common';
import { CutitemsService } from './cutitems.service';
import { CutitemsController } from './cutitems.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cutitem } from './entities/cutitem.entity';
import { WarehousesModule } from 'src/warehouses/warehouses.module';
import { CutsModule } from 'src/cuts/cuts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cutitem]), WarehousesModule, CutsModule],
  controllers: [CutitemsController],
  providers: [CutitemsService],
  exports: [CutitemsService],
})
export class CutitemsModule {}
