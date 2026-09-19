import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMarkupDto } from './dto/create-markup.dto';
import { UpdateMarkupDto } from './dto/update-markup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Markup } from './entities/markup.entity';
import { Repository } from 'typeorm';
import { WarehousesService } from 'src/warehouses/warehouses.service';

@Injectable()
export class MarkupsService {
  constructor(
    @InjectRepository(Markup)
    private markupsRepository: Repository<Markup>,
    private warehousesService: WarehousesService,
  ) {}

  // create(warehouse: Warehouse, createMarkupDto: CreateMarkupDto) {
  async create(createMarkupDto: CreateMarkupDto) {
    const warehouse = await this.warehousesService.findOne({
      where: { id: createMarkupDto.warehouseId },
      // relations: {
      //   markup: true,
      // },
    });

    console.log('warehouse: ');
    console.log(warehouse);

    const markup = this.markupsRepository.create({
      ...createMarkupDto,
      warehouse: warehouse,
    });

    return this.markupsRepository.save(markup);
  }

  findAll() {
    return `This action returns all markups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} markup`;
  }

  async findOneById(id: number) {
    const markup = await this.markupsRepository.findOne({
      where: { id: id },
    });
    if (!markup) {
      throw new NotFoundException();
    }
    // TODO метод не доделан, ничего не возвращает
    // должен возвращать markup
  }

  async findOneByWarehouseId(id: number) {
    const markup = await this.markupsRepository.findOne({
      where: {
        warehouse: { id: id },
      },
      relations: {
        warehouse: true,
      },
    });
    if (!markup) {
      throw new NotFoundException();
    }
    // console.log(markup);
    return markup;
  }

  update(id: number, updateMarkupDto: UpdateMarkupDto) {
    return `This action updates a #${id} markup`;
  }

  remove(id: number) {
    return `This action removes a #${id} markup`;
  }
}
