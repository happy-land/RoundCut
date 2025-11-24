import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCutitemDto } from './dto/create-cutitem.dto';
import { UpdateCutitemDto } from './dto/update-cutitem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cutitem } from './entities/cutitem.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository, ILike } from 'typeorm';
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

    // For small diameters (<50) prefer off-cut machine; for >=50 prefer band-saw
    const nameFragment = size < 50 ? 'отрезным станком' : 'лентопильным станком';
    console.log(`Searching cutitem in warehouse ${id} for size ${size} with name fragment "${nameFragment}"`);

    const cutitemByName = await this.findCutitemByCutNameFragment(id, size, nameFragment);
    console.log('cutitemByName:');
    console.log(cutitemByName);
    if (cutitemByName) return cutitemByName;

    // Fallback: original behaviour — search any cutitem covering the size interval
    // const cutitem = await this.cutitemsRepository.findOne({
    //   where: [
    //     {
    //       warehouse: { id: id },
    //       from: LessThanOrEqual(size),
    //       to: MoreThanOrEqual(size),
    //     },
    //   ],
    // });
    // if (!cutitem) {
    //   return new NotFoundException('Резка не найдена');
    // }
    // return cutitem;
  }

  private async findCutitemByCutNameFragment(
    warehouseId: number,
    size: number,
    nameFragment: string,
  ) {
    // find Cut by name fragment (case-insensitive)
    // const cut = await this.cutsService.findOne({ where: { name: ILike(`%${nameFragment}%`) } });
    // console.log('cut found by name fragment:');
    // console.log(cut);
    // if (!cut) return null;

    // find cutitem for the found cut and warehouse that covers the size interval
    const cutitem = await this.cutitemsRepository.findOne({
      where: [
        {
          warehouse: { id: warehouseId },
          name: ILike(`%${nameFragment}%`),
          // cut: { id: cut.id },
          from: LessThanOrEqual(size),
          to: MoreThanOrEqual(size),
        },
      ],
    });

    return cutitem || null;
  }
}
