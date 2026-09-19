import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehousesRepository: Repository<Warehouse>,
  ) {}
  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const { name /*, description*/ } = createWarehouseDto;

    const warehouse = await this.warehousesRepository.find({
      where: [{ name: name }],
    });

    if (warehouse.length !== 0) {
      throw new ConflictException('Такой склад уже есть');
    }

    const createdWarehouse =
      this.warehousesRepository.create(createWarehouseDto);

    console.log(`warehouse: ${createdWarehouse}`);

    return this.warehousesRepository.save(createdWarehouse);
  }

  async findAll() {
    const warehouses = await this.warehousesRepository.find({
      order: {
        name: 'ASC',
      },
    });
    return warehouses;
  }

  findOne(query: FindOneOptions<Warehouse>) {
    return this.warehousesRepository.findOne(query);
  }

  async findOneById(id: number) {
    const warehouse = await this.warehousesRepository.findOne({
      where: { id: id },
    });
    if (!warehouse) {
      throw new NotFoundException();
    }

    return warehouse;
  }

  async findOneByName(name: string) {
    const warehouse = await this.warehousesRepository.findOne({
      where: { name: name },
    });
    if (!warehouse) {
      throw new NotFoundException();
    }
    return warehouse;
  }

  update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    return `This action updates a #${id} warehouse`;
  }

  async remove(id: number) {
    const warehouse = await this.warehousesRepository.findOne({
      where: { id: id },
      relations: {
        markup: true,
        cutitems: true,
        priceitems: true,
      },
    });
    if (!warehouse) {
      throw new NotFoundException();
    }
    console.log('deleting');
    console.log(warehouse);
    await this.warehousesRepository.delete({ id });
    return warehouse;
  }
}
