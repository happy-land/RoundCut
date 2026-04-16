import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePriceitemDto } from './dto/create-priceitem.dto';
import { UpdatePriceitemDto } from './dto/update-priceitem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Priceitem } from './entities/priceitem.entity';
import { Repository } from 'typeorm';
import { WarehousesService } from 'src/warehouses/warehouses.service';
import { CategoriesService } from 'src/categories/categories.service';
import { Cutitem } from 'src/cutitems/entities/cutitem.entity';

@Injectable()
export class PriceitemsService {
  constructor(
    @InjectRepository(Priceitem)
    private readonly priceitemsRepository: Repository<Priceitem>,
    @InjectRepository(Cutitem)
    private readonly cutitemsRepository: Repository<Cutitem>,
    private readonly warehousesService: WarehousesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createPriceitemDto: CreatePriceitemDto) {
    const warehouse = await this.warehousesService.findOne({
      where: { name: createPriceitemDto.baseName },
    });

    const category = await this.categoriesService.findOne({
      where: { name: createPriceitemDto.catName },
    });

    const createdItem = this.priceitemsRepository.create({
      ...createPriceitemDto,
      warehouse,
      category,
    });
    await this.priceitemsRepository.save(createdItem);
  }

  async createMany(createPriceitemDto: CreatePriceitemDto[]) {
    for (let i = 0; i < createPriceitemDto.length; i++) {
      const itemDto = createPriceitemDto[i];
      try {
        await this.create(itemDto);
      } catch (err) {
        console.error(
          `[createMany] Ошибка на строке ${i + 1} / ${createPriceitemDto.length}:`,
          JSON.stringify(itemDto),
        );
        throw err;
      }
    }
  }

  async findAll(warehouseId: string) {
    const warehouse = await this.warehousesService.findOne({
      where: { id: +warehouseId },
    });
    console.log(`-> findAll ${warehouseId}`);

    const [priceitems, cutitems] = await Promise.all([
      this.priceitemsRepository.find({
        where: { baseName: warehouse.name },
      }),
      this.cutitemsRepository.find({
        where: { warehouse: { id: +warehouseId } },
        relations: { cut: true },
      }),
    ]);

    return priceitems.map((item) => {
      const sizeNum = parseFloat(item.size);
      const availableCuts = isNaN(sizeNum)
        ? []
        : Array.from(new Set(
            cutitems
              .filter((ci) => ci.cut && ci.amount > 0 && ci.from <= sizeNum && sizeNum <= ci.to)
              .map((ci) => ci.cut.code ?? ci.cut.name),
          ));
      return { ...item, availableCuts };
    });
  }

  async findOne(id: number) {
    const priceitem = await this.priceitemsRepository.findOne({
      where: { id: id },
      relations: {
        warehouse: true,
      },
    });

    if (!priceitem) {
      throw new NotFoundException(`Price item with ID ${id} not found`);
    }
    return priceitem;
  }

  update(id: number, updatePriceitemDto: UpdatePriceitemDto) {
    return `This action updates a #${id} priceitem`;
  }

  async remove(id: number) {
    const item = await this.priceitemsRepository.findOne({
      where: { id: id },
    });
    if (!item) {
      throw new NotFoundException(`Price item with ID ${id} not found`);
    }

    await this.priceitemsRepository.delete({ id });
    return item;
  }

  async removeAll() {
    console.log('--REMOVE ALL!');
    const items = await this.priceitemsRepository.find({});

    if (!items) {
      throw new NotFoundException(`Items to remove not found`);
    }
    await this.priceitemsRepository.delete(items);
    return items;
  }
}
