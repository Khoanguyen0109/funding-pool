import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findByPool(poolId: string): Promise<Expense[]> {
    return this.expenseRepo.find({
      where: { poolId },
      relations: ['user', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(poolId: string, userId: string, dto: CreateExpenseDto): Promise<Expense> {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId, poolId },
    });
    if (!category) throw new NotFoundException('Category not found in this pool');

    const expense = this.expenseRepo.create({
      amount: dto.amount,
      description: dto.description,
      receiptUrl: dto.receiptUrl,
      poolId,
      userId,
      categoryId: dto.categoryId,
    });
    const saved = await this.expenseRepo.save(expense);
    return this.expenseRepo.findOne({
      where: { id: saved.id },
      relations: ['user', 'category'],
    }) as Promise<Expense>;
  }
}
