import { Controller, Get, Post, Body, Query, } from '@nestjs/common';
import { CutitemsService } from './cutitems.service';
import { CreateCutitemDto } from './dto/create-cutitem.dto';

@Controller('cutitems')
export class CutitemsController {
  constructor(private readonly cutitemsService: CutitemsService) { }

  @Post()
  create(@Body() createCutitemDto: CreateCutitemDto) {
    return this.cutitemsService.create(createCutitemDto);
  }

  @Get('find')
  findByParams(
    @Query('warehouseId') id: string,
    @Query('sizeNum') size: string,
  ) {
    return this.cutitemsService.findByParams(+id, +size);
  }

  @Get('findAll')
  findAllByParams(
    @Query('warehouseId') id: string,
    @Query('sizeNum') size: string,
  ) {
    return this.cutitemsService.findAllByParams(+id, +size);
  }
}
