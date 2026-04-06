import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MarkupsService } from './markups.service';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('markups')
export class MarkupsController {
  constructor(private readonly markupsService: MarkupsService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkupDto: UpdateMarkupDto) {
    return this.markupsService.update(+id, updateMarkupDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markupsService.remove(+id);
  }
}
