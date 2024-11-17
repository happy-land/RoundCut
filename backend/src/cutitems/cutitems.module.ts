import { Module } from '@nestjs/common';
import { CutitemsService } from './cutitems.service';
import { CutitemsController } from './cutitems.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cutitem } from './entities/cutitem.entity';
import { WarehousesModule } from 'src/warehouses/warehouses.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cutitem]), WarehousesModule],
  controllers: [CutitemsController],
  providers: [CutitemsService],
  exports: [CutitemsService],
})
export class CutitemsModule {}
