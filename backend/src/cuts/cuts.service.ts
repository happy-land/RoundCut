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

  findOne(id: number) {
    return `This action returns a #${id} cut`;
  }

  update(id: number, updateCutDto: UpdateCutDto) {
    return `This action updates a #${id} cut`;
  }

  remove(id: number) {
    return `This action removes a #${id} cut`;
  }
}
