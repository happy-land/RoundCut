import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CutitemsService } from './cutitems.service';
import { CreateCutitemDto } from './dto/create-cutitem.dto';
import { UpdateCutitemDto } from './dto/update-cutitem.dto';

@Controller('cutitems')
export class CutitemsController {
  constructor(private readonly cutitemsService: CutitemsService) {}

  @Post()
  create(@Body() createCutitemDto: CreateCutitemDto) {
    return this.cutitemsService.create(createCutitemDto);
  }

  // @Get()
  // findAll() {
  //   return this.cutitemsService.findAll();
  // }

  @Get('find')
  findByParams(
    @Query('warehouseId') id: string,
    @Query('sizeNum') size: string,
  ) {
    return this.cutitemsService.findByParams(+id, +size);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cutitemsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCutitemDto: UpdateCutitemDto) {
    return this.cutitemsService.update(+id, updateCutitemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cutitemsService.remove(+id);
  }
}
