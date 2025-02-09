import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCutitemDto } from './dto/create-cutitem.dto';
import { UpdateCutitemDto } from './dto/update-cutitem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cutitem } from './entities/cutitem.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { WarehousesService } from 'src/warehouses/warehouses.service';
import { CutsService } from 'src/cuts/cuts.service';
import { extractInterval } from 'src/utils/utils';

@Injectable()
export class CutitemsService {
  constructor(
    @InjectRepository(Cutitem)
    private cutitemsRepository: Repository<Cutitem>,
    private warehousesService: WarehousesService,
    private cutsService: CutsService,
  ) {}

  async create(createCutitemDto: CreateCutitemDto) {
    const warehouse = await this.warehousesService.findOne({
      where: { id: createCutitemDto.warehouse_id },
    });

    const cut = await this.cutsService.findOne({
      where: { id: createCutitemDto.cut_id },
    });

    const [from, to] = extractInterval(createCutitemDto.name);

    const cutitem = this.cutitemsRepository.create({
      ...createCutitemDto,
      from,
      to,
      warehouse: warehouse,
      cut: cut,
    });
    return this.cutitemsRepository.save(cutitem);
  }

  async findByParams(id: number, size: number) {
    // const warehouse = await this.warehousesService.findOne({
    //   where: { id: id },
    // });

    // if (!warehouse) {
    //   return new NotFoundException(`Склад с id #${id} не найден`);
    // }

    const cutitem = await this.cutitemsRepository.findOne({
      where: [
        {
          warehouse: { id: id },
          from: LessThanOrEqual(size),
          to: MoreThanOrEqual(size),
        },
      ],
    });
    if (!cutitem) {
      return new NotFoundException('Резка не найдена');
    }
    return cutitem;
    // return `This action returns a cutitem with warehouse id #${id} and size #${size}`;
  }

  findAll() {
    return `This action returns all cutitems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cutitem`;
  }

  update(id: number, updateCutitemDto: UpdateCutitemDto) {
    return `This action updates a #${id} cutitem`;
  }

  remove(id: number) {
    return `This action removes a #${id} cutitem`;
  }
}
