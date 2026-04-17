import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findByPool(poolId: string): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { poolId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(poolId: string, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create({ ...dto, poolId });
    return this.categoryRepo.save(category);
  }
}
