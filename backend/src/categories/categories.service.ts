import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;
    const category = await this.categoriesRepository.find({
      where: [{ name: name }],
    });

    if (category.length !== 0) {
      throw new ConflictException('Категория с таким названием уже есть');
    }

    const createdCategory = this.categoriesRepository.create(createCategoryDto);

    return this.categoriesRepository.save(createdCategory);
  }

  async findAll() {
    const categories = await this.categoriesRepository.find();
    return categories;
  }

  findOne(query: FindOneOptions<Category>) {
    return this.categoriesRepository.findOne(query);
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
