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
import { PriceitemsService } from './priceitems.service';
import { CreatePriceitemDto } from './dto/create-priceitem.dto';
import { UpdatePriceitemDto } from './dto/update-priceitem.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('priceitems')
export class PriceitemsController {
  constructor(private readonly priceitemsService: PriceitemsService) {}

  @Get()
  findAll() {
    return this.priceitemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceitemsService.findOne(+id);
  }

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createPriceitemDto: CreatePriceitemDto) {
    return this.priceitemsService.create(createPriceitemDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePriceitemDto: UpdatePriceitemDto,
  ) {
    return this.priceitemsService.update(+id, updatePriceitemDto);
  }

  @Delete('all')
  removeAll() {
    console.log('removeAll');
    return this.priceitemsService.removeAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log(id);
    return this.priceitemsService.remove(id);
  }
}
