import { Injectable } from '@nestjs/common';
import { CreateCutitemDto } from './dto/create-cutitem.dto';
import { UpdateCutitemDto } from './dto/update-cutitem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cutitem } from './entities/cutitem.entity';
import { Repository } from 'typeorm';
import { WarehousesService } from 'src/warehouses/warehouses.service';
import { CutsService } from 'src/cuts/cuts.service';

@Injectable()
export class CutitemsService {
  constructor(
    @InjectRepository(Cutitem)
    private cutitemsRepository: Repository<Cutitem>,
    private warehousesService: WarehousesService,
    // private cutsService: CutsService,
  ) {}

  async create(createCutitemDto: CreateCutitemDto) {
    const warehouse = await this.warehousesService.findOne({
      where: { id: createCutitemDto.warehouse_id },
    });

    // const cut = await this.cutsService.findOne({
    //   where: { id: createCutitemDto.cut_id },
    // });

    console.log('warehouse: ');
    console.log(warehouse);

    const cutitem = this.cutitemsRepository.create({
      ...createCutitemDto,
      warehouse: warehouse,
    });
    return this.cutitemsRepository.save(cutitem);
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
