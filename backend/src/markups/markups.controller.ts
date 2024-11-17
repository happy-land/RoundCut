import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MarkupsService } from './markups.service';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';

@Controller('markups')
export class MarkupsController {
  constructor(private readonly markupsService: MarkupsService) {}

  @Post()
  create(@Body() createMarkupDto: CreateMarkupDto) {
    return this.markupsService.create(createMarkupDto);
  }

  @Get()
  findAll() {
    return this.markupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.markupsService.findOneById(id);
  }

  @Get('/warehouse/:id')
  findOneByWarehouseId(@Param('id') id: number) {
    return this.markupsService.findOneByWarehouseId(id);
    // return `ID склада warehouseId: ${id}`;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkupDto: UpdateMarkupDto) {
    return this.markupsService.update(+id, updateMarkupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markupsService.remove(+id);
  }
}
