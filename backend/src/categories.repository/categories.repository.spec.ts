import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesRepository } from './categories.repository';

describe('CategoriesRepository', () => {
  let provider: CategoriesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesRepository],
    }).compile();

    provider = module.get<CategoriesRepository>(CategoriesRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
