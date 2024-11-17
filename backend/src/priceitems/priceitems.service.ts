import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePriceitemDto } from './dto/create-priceitem.dto';
import { UpdatePriceitemDto } from './dto/update-priceitem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Priceitem } from './entities/priceitem.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PriceitemsService {
  constructor(
    @InjectRepository(Priceitem)
    private readonly priceitemsRepository: Repository<Priceitem>,
  ) {}

  create(createPriceitemDto: CreatePriceitemDto) {
    return 'This action adds a new priceitem';
  }

  async findAll() {
    console.log('-> findAll');
    const priceitems = await this.priceitemsRepository.find();
    console.log(priceitems.length);
    return priceitems;
  }

  findOne(id: number) {
    return `This action returns a #${id} priceitem`;
  }

  update(id: number, updatePriceitemDto: UpdatePriceitemDto) {
    return `This action updates a #${id} priceitem`;
  }

  async remove(id: string) {
    const item = await this.priceitemsRepository.findOne({
      where: { id: id },
    });
    if (!item) {
      throw new NotFoundException();
    }

    await this.priceitemsRepository.delete({ id });
    return item;
  }

  async removeAll() {
    console.log('--REMOVE ALL!');
    const items = await this.priceitemsRepository.find({});

    if (!items) {
      throw new NotFoundException();
    }
    await this.priceitemsRepository.delete(items);
    return items;
  }
}
