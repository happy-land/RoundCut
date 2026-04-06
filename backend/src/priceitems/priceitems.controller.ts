import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PriceitemsService } from './priceitems.service';
import { CreatePriceitemDto } from './dto/create-priceitem.dto';
import { UpdatePriceitemDto } from './dto/update-priceitem.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('priceitems')
export class PriceitemsController {
  constructor(private readonly priceitemsService: PriceitemsService) {}

  @Get()
  findAll(@Query('warehouseId') warehouseId: string) {
    console.log(warehouseId);
    return this.priceitemsService.findAll(warehouseId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.priceitemsService.findOne(+id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createPriceitemDto: CreatePriceitemDto) {
    return this.priceitemsService.create(createPriceitemDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Post('all')
  createMany(@Body() createPriceitemDto: CreatePriceitemDto[]) {
    return this.priceitemsService.createMany(createPriceitemDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePriceitemDto: UpdatePriceitemDto,
  ) {
    return this.priceitemsService.update(+id, updatePriceitemDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete('all')
  removeAll() {
    console.log('removeAll');
    return this.priceitemsService.removeAll();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: number) {
    console.log(id);
    return this.priceitemsService.remove(id);
  }
}
