import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pool } from './entities/pool.entity';
import { PoolMembership, MemberRole } from './entities/pool-membership.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { UsersService } from '../users/users.service';
import { CreatePoolDto } from './dto/create-pool.dto';

@Injectable()
export class PoolsService {
  constructor(
    @InjectRepository(Pool)
    private readonly poolsRepository: Repository<Pool>,
    @InjectRepository(PoolMembership)
    private readonly membershipsRepository: Repository<PoolMembership>,
    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    private readonly usersService: UsersService,
  ) {}

  async findAllByUser(userId: string): Promise<Pool[]> {
    const memberships = await this.membershipsRepository.find({
      where: { userId },
      relations: ['pool', 'pool.categories', 'pool.members'],
    });
    return memberships
      .filter((m) => m.pool && !m.pool.deletedAt)
      .map((m) => m.pool);
  }

  async findById(id: string): Promise<Pool | null> {
    return this.poolsRepository.findOne({
      where: { id },
      relations: ['categories', 'members', 'members.user', 'owner'],
    });
  }

  async findByIdForUser(id: string, userId: string): Promise<Pool> {
    await this.requireMembership(id, userId);
    const pool = await this.findById(id);
    if (!pool) throw new NotFoundException('Pool not found');
    return pool;
  }

  async create(userId: string, dto: CreatePoolDto): Promise<Pool> {
    const pool = this.poolsRepository.create({
      ...dto,
      ownerId: userId,
    });
    const savedPool = await this.poolsRepository.save(pool);

    const membership = this.membershipsRepository.create({
      userId,
      poolId: savedPool.id,
      role: MemberRole.OWNER,
      canInvite: true,
      canEditCategories: true,
    });
    await this.membershipsRepository.save(membership);

    return this.findById(savedPool.id) as Promise<Pool>;
  }

  async getMembership(poolId: string, userId: string): Promise<PoolMembership | null> {
    return this.membershipsRepository.findOne({
      where: { poolId, userId },
    });
  }

  async remove(poolId: string, userId: string): Promise<void> {
    const pool = await this.poolsRepository.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Pool not found');
    if (pool.ownerId !== userId) throw new ForbiddenException('Only the pool owner can delete this pool');
    await this.usersService.clearDefaultPoolReferencing(poolId);
    await this.poolsRepository.softRemove(pool);
  }

  async requireMembership(poolId: string, userId: string): Promise<PoolMembership> {
    const membership = await this.getMembership(poolId, userId);
    if (!membership) throw new ForbiddenException('You are not a member of this pool');
    return membership;
  }

  async getTransactions(poolId: string, userId: string) {
    await this.requireMembership(poolId, userId);

    const [contributions, expenses] = await Promise.all([
      this.contributionRepo.find({
        where: { poolId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      }),
      this.expenseRepo.find({
        where: { poolId },
        relations: ['user', 'category'],
        order: { createdAt: 'DESC' },
      }),
    ]);

    const transactions = [
      ...contributions.map((c) => ({
        id: c.id,
        type: 'income' as const,
        amount: Number(c.amount),
        description: c.note || 'Contribution',
        user: { id: c.user.id, name: c.user.name },
        category: null,
        transactionDate: c.transactionDate || c.createdAt,
        createdAt: c.createdAt,
      })),
      ...expenses.map((e) => ({
        id: e.id,
        type: 'expense' as const,
        amount: Number(e.amount),
        description: e.description,
        user: { id: e.user.id, name: e.user.name },
        category: e.category ? { id: e.category.id, name: e.category.name, icon: e.category.icon } : null,
        status: e.status,
        transactionDate: e.transactionDate || e.createdAt,
        createdAt: e.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return transactions;
  }

  async softDeleteTransaction(
    poolId: string,
    userId: string,
    transactionId: string,
    type: 'income' | 'expense',
  ): Promise<void> {
    await this.requireMembership(poolId, userId);

    if (type === 'income') {
      const row = await this.contributionRepo.findOne({
        where: { id: transactionId, poolId },
      });
      if (!row) throw new NotFoundException('Transaction not found');
      await this.contributionRepo.softRemove(row);
      return;
    }

    const row = await this.expenseRepo.findOne({
      where: { id: transactionId, poolId },
    });
    if (!row) throw new NotFoundException('Transaction not found');
    await this.expenseRepo.softRemove(row);
  }
}
