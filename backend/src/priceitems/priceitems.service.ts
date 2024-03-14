import { Injectable } from '@nestjs/common';
import { CreatePriceitemDto } from './dto/create-priceitem.dto';
import { UpdatePriceitemDto } from './dto/update-priceitem.dto';

@Injectable()
export class PriceitemsService {
  create(createPriceitemDto: CreatePriceitemDto) {
    return 'This action adds a new priceitem';
  }

  findAll() {
    return `This action returns all priceitems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} priceitem`;
  }

  update(id: number, updatePriceitemDto: UpdatePriceitemDto) {
    return `This action updates a #${id} priceitem`;
  }

  remove(id: number) {
    return `This action removes a #${id} priceitem`;
  }
}
