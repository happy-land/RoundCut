import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCutDto } from './dto/create-cut.dto';
import { UpdateCutDto } from './dto/update-cut.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cut } from './entities/cut.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class CutsService {
  constructor(
    @InjectRepository(Cut)
    private cutsRepository: Repository<Cut>,
  ) {}
  async create(createCutDto: CreateCutDto) {
    const { name } = createCutDto;
    const cut = await this.cutsRepository.find({
      where: [{ name: name }],
    });

    if (cut.length !== 0) {
      throw new ConflictException('Резка с таким названием уже есть');
    }

    const createdCut = this.cutsRepository.create(createCutDto);

    return this.cutsRepository.save(createdCut);
  }

  async findAll() {
    const cuts = await this.cutsRepository.find();
    return cuts;
  }

  findOne(query: FindOneOptions<Cut>) {
    return this.cutsRepository.findOne(query);
  }

  async findOneById(id: number) {
    const cut = await this.cutsRepository.findOne({
      where: { id: id },
    });
    if (!cut) {
      throw new NotFoundException('резка не найдена');
    }
    return cut;
  }

  async update(id: number, updateCutDto: UpdateCutDto) {
    const cut = await this.findOneById(id);

    // Если обновляется название - проверить на дубликат
    if (updateCutDto.name && updateCutDto.name !== cut.name) {
      const existing = await this.cutsRepository.findOne({
        where: { name: updateCutDto.name },
      });

      if (existing) {
        throw new ConflictException('Резка с таким названием уже существует');
      }
    }

    // Обновляем только переданные поля
    const updated = this.cutsRepository.merge(cut, updateCutDto);
    return this.cutsRepository.save(updated);
  }

  async remove(id: number) {
    const cut = await this.findOneById(id);
    return this.cutsRepository.remove(cut);
  }
}
