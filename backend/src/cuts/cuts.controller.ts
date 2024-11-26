import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CutsService } from './cuts.service';
import { CreateCutDto } from './dto/create-cut.dto';
import { UpdateCutDto } from './dto/update-cut.dto';

@Controller('cuts')
export class CutsController {
  constructor(private readonly cutsService: CutsService) {}

  @Post()
  create(@Body() createCutDto: CreateCutDto) {
    return this.cutsService.create(createCutDto);
  }

  @Get()
  findAll() {
    return this.cutsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.cutsService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCutDto: UpdateCutDto) {
    return this.cutsService.update(+id, updateCutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cutsService.remove(+id);
  }
}
