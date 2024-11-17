import { Module } from '@nestjs/common';
import { MarkupsService } from './markups.service';
import { MarkupsController } from './markups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Markup } from './entities/markup.entity';
import { WarehousesModule } from 'src/warehouses/warehouses.module';

@Module({
  imports: [TypeOrmModule.forFeature([Markup]), WarehousesModule],
  controllers: [MarkupsController],
  providers: [MarkupsService],
  exports: [MarkupsService],
})
export class MarkupsModule {}
