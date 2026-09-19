import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CutitemsService } from './cutitems.service';
import { CreateCutitemDto } from './dto/create-cutitem.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('cutitems')
export class CutitemsController {
  constructor(private readonly cutitemsService: CutitemsService) { }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
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
