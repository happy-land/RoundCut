import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePriceitemDto } from './dto/create-priceitem.dto';
import { UpdatePriceitemDto } from './dto/update-priceitem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Priceitem } from './entities/priceitem.entity';
import { Repository } from 'typeorm';
import { WarehousesService } from 'src/warehouses/warehouses.service';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class PriceitemsService {
  constructor(
    @InjectRepository(Priceitem)
    private readonly priceitemsRepository: Repository<Priceitem>,
    private readonly warehousesService: WarehousesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createPriceitemDto: CreatePriceitemDto) {
    const warehouse = await this.warehousesService.findOne({
      where: { name: createPriceitemDto.baseName },
    });

    const category = await this.categoriesService.findOne({
      where: { name: createPriceitemDto.categoryName },
    });

    const createdItem = this.priceitemsRepository.create({
      ...createPriceitemDto,
      warehouse,
      category,
    });
    this.priceitemsRepository.save(createdItem);
  }

  async createMany(createPriceitemDto: CreatePriceitemDto[]) {
    createPriceitemDto.map((itemDto) => this.create(itemDto));
    // return createPriceitemDto.slice(100, 120);
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

  async remove(id: number) {
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
