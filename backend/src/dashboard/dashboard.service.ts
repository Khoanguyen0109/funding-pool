import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pool } from '../pools/entities/pool.entity';
import { PoolMembership } from '../pools/entities/pool-membership.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Category } from '../categories/entities/category.entity';
import { UsersService } from '../users/users.service';

interface DashboardSummary {
  totalBalance: number;
  totalContributions: number;
  totalExpenses: number;
  poolCount: number;
}

interface CategoryBudget {
  name: string;
  budget: number;
  spent: number;
  remaining: number;
}

interface MonthlyFlow {
  month: string;
  contributions: number;
  expenses: number;
}

interface SpendingBreakdown {
  name: string;
  value: number;
  color: string;
}

interface MonthlyTrend {
  month: string;
  balance: number;
  savings: number;
}

interface PoolSummary {
  id: string;
  name: string;
  color: string;
  icon: string;
  currency: string;
  balance: number;
  totalBudget: number;
  totalSpent: number;
  memberCount: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  pools: PoolSummary[];
  categoryBudgets: CategoryBudget[];
  monthlyFlow: MonthlyFlow[];
  spendingBreakdown: SpendingBreakdown[];
  monthlyTrends: MonthlyTrend[];
  defaultPoolId: string | null;
}

const CATEGORY_COLORS = [
  '#A855F7', '#E91E8C', '#34D399', '#60A5FA',
  '#FBBF24', '#F472B6', '#C084FC', '#F87171',
  '#7C3AED', '#BE185D', '#059669', '#2563EB',
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Pool)
    private readonly poolRepo: Repository<Pool>,
    @InjectRepository(PoolMembership)
    private readonly membershipRepo: Repository<PoolMembership>,
    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly usersService: UsersService,
  ) {}

  async getDashboard(userId: string): Promise<DashboardResponse> {
    const defaultPoolId = await this.getDefaultPoolId(userId);
    const poolIds = await this.getUserPoolIds(userId);

    if (poolIds.length === 0) {
      return {
        summary: { totalBalance: 0, totalContributions: 0, totalExpenses: 0, poolCount: 0 },
        pools: [],
        categoryBudgets: [],
        monthlyFlow: [],
        spendingBreakdown: [],
        monthlyTrends: [],
        defaultPoolId,
      };
    }

    const [summary, pools, categoryBudgets, monthlyFlow, spendingBreakdown, monthlyTrends] =
      await Promise.all([
        this.getSummary(poolIds),
        this.getPoolSummaries(poolIds),
        this.getCategoryBudgets(poolIds),
        this.getMonthlyFlow(poolIds),
        this.getSpendingBreakdown(poolIds),
        this.getMonthlyTrends(poolIds),
      ]);

    return {
      summary,
      pools,
      categoryBudgets,
      monthlyFlow,
      spendingBreakdown,
      monthlyTrends,
      defaultPoolId,
    };
  }

  private async getDefaultPoolId(userId: string): Promise<string | null> {
    const user = await this.usersService.findById(userId);
    return user?.defaultPoolId ?? null;
  }

  private async getUserPoolIds(userId: string): Promise<string[]> {
    const memberships = await this.membershipRepo
      .createQueryBuilder('m')
      .innerJoin('m.pool', 'p')
      .where('m.user_id = :userId', { userId })
      .andWhere('p.deleted_at IS NULL')
      .select('m.pool_id', 'poolId')
      .getRawMany();
    return memberships.map((m) => m.poolId);
  }

  private async getSummary(poolIds: string[]): Promise<DashboardSummary> {
    const [contribResult, expenseResult] = await Promise.all([
      this.contributionRepo
        .createQueryBuilder('c')
        .select('COALESCE(SUM(c.amount), 0)', 'total')
        .where('c.pool_id IN (:...poolIds)', { poolIds })
        .andWhere('c.deleted_at IS NULL')
        .getRawOne(),
      this.expenseRepo
        .createQueryBuilder('e')
        .select('COALESCE(SUM(e.amount), 0)', 'total')
        .where('e.pool_id IN (:...poolIds)', { poolIds })
        .andWhere('e.deleted_at IS NULL')
        .getRawOne(),
    ]);

    const totalContributions = parseFloat(contribResult.total);
    const totalExpenses = parseFloat(expenseResult.total);

    return {
      totalBalance: totalContributions - totalExpenses,
      totalContributions,
      totalExpenses,
      poolCount: poolIds.length,
    };
  }

  private async getPoolSummaries(poolIds: string[]): Promise<PoolSummary[]> {
    const pools = await this.poolRepo
      .createQueryBuilder('p')
      .leftJoin('p.members', 'm')
      .leftJoin('p.contributions', 'c', 'c.deleted_at IS NULL')
      .leftJoin('p.expenses', 'e', 'e.deleted_at IS NULL')
      .leftJoin('p.categories', 'cat', 'cat.deleted_at IS NULL')
      .select([
        'p.id AS id',
        'p.name AS name',
        'p.color AS color',
        'p.icon AS icon',
        'p.currency AS currency',
        'COALESCE(SUM(DISTINCT c.amount), 0) AS "totalContributions"',
        'COALESCE(SUM(DISTINCT e.amount), 0) AS "totalExpenses"',
        'COALESCE(SUM(DISTINCT cat.budget_amount), 0) AS "totalBudget"',
        'COUNT(DISTINCT m.id) AS "memberCount"',
      ])
      .where('p.id IN (:...poolIds)', { poolIds })
      .groupBy('p.id')
      .getRawMany();

    return pools.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      icon: p.icon,
      currency: p.currency ?? 'VND',
      balance: parseFloat(p.totalContributions) - parseFloat(p.totalExpenses),
      totalBudget: parseFloat(p.totalBudget),
      totalSpent: parseFloat(p.totalExpenses),
      memberCount: parseInt(p.memberCount, 10),
    }));
  }

  private async getCategoryBudgets(poolIds: string[]): Promise<CategoryBudget[]> {
    const results = await this.categoryRepo
      .createQueryBuilder('cat')
      .leftJoin('cat.expenses', 'e', 'e.deleted_at IS NULL')
      .select([
        'cat.name AS name',
        'COALESCE(cat.budget_amount, 0) AS budget',
        'COALESCE(SUM(e.amount), 0) AS spent',
      ])
      .where('cat.pool_id IN (:...poolIds)', { poolIds })
      .andWhere('cat.deleted_at IS NULL')
      .groupBy('cat.id')
      .addGroupBy('cat.name')
      .addGroupBy('cat.budget_amount')
      .orderBy('cat.sort_order', 'ASC')
      .getRawMany();

    return results.map((r) => {
      const budget = parseFloat(r.budget);
      const spent = parseFloat(r.spent);
      return { name: r.name, budget, spent, remaining: budget - spent };
    });
  }

  private async getMonthlyFlow(poolIds: string[]): Promise<MonthlyFlow[]> {
    const months = this.getLast6Months();
    const [contributions, expenses] = await Promise.all([
      this.contributionRepo
        .createQueryBuilder('c')
        .select("TO_CHAR(c.created_at, 'YYYY-MM')", 'month')
        .addSelect('COALESCE(SUM(c.amount), 0)', 'total')
        .where('c.pool_id IN (:...poolIds)', { poolIds })
        .andWhere('c.deleted_at IS NULL')
        .andWhere('c.created_at >= :since', { since: months[0].start })
        .groupBy("TO_CHAR(c.created_at, 'YYYY-MM')")
        .getRawMany(),
      this.expenseRepo
        .createQueryBuilder('e')
        .select("TO_CHAR(e.created_at, 'YYYY-MM')", 'month')
        .addSelect('COALESCE(SUM(e.amount), 0)', 'total')
        .where('e.pool_id IN (:...poolIds)', { poolIds })
        .andWhere('e.deleted_at IS NULL')
        .andWhere('e.created_at >= :since', { since: months[0].start })
        .groupBy("TO_CHAR(e.created_at, 'YYYY-MM')")
        .getRawMany(),
    ]);

    const contribMap = new Map(contributions.map((c) => [c.month, parseFloat(c.total)]));
    const expenseMap = new Map(expenses.map((e) => [e.month, parseFloat(e.total)]));

    return months.map((m) => ({
      month: m.key,
      contributions: contribMap.get(m.key) ?? 0,
      expenses: expenseMap.get(m.key) ?? 0,
    }));
  }

  private async getSpendingBreakdown(poolIds: string[]): Promise<SpendingBreakdown[]> {
    const results = await this.expenseRepo
      .createQueryBuilder('e')
      .innerJoin('e.category', 'cat', 'cat.deleted_at IS NULL')
      .select('cat.name', 'name')
      .addSelect('COALESCE(SUM(e.amount), 0)', 'value')
      .where('e.pool_id IN (:...poolIds)', { poolIds })
      .andWhere('e.deleted_at IS NULL')
      .groupBy('cat.id')
      .addGroupBy('cat.name')
      .orderBy('value', 'DESC')
      .getRawMany();

    return results.map((r, i) => ({
      name: r.name,
      value: parseFloat(r.value),
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }

  private async getMonthlyTrends(poolIds: string[]): Promise<MonthlyTrend[]> {
    const months = this.getLast6Months();

    const [contributions, expenses] = await Promise.all([
      this.contributionRepo
        .createQueryBuilder('c')
        .select("TO_CHAR(c.created_at, 'YYYY-MM')", 'month')
        .addSelect('COALESCE(SUM(c.amount), 0)', 'total')
        .where('c.pool_id IN (:...poolIds)', { poolIds })
        .andWhere('c.deleted_at IS NULL')
        .groupBy("TO_CHAR(c.created_at, 'YYYY-MM')")
        .orderBy('month', 'ASC')
        .getRawMany(),
      this.expenseRepo
        .createQueryBuilder('e')
        .select("TO_CHAR(e.created_at, 'YYYY-MM')", 'month')
        .addSelect('COALESCE(SUM(e.amount), 0)', 'total')
        .where('e.pool_id IN (:...poolIds)', { poolIds })
        .andWhere('e.deleted_at IS NULL')
        .groupBy("TO_CHAR(e.created_at, 'YYYY-MM')")
        .orderBy('month', 'ASC')
        .getRawMany(),
    ]);

    const allContribMap = new Map(contributions.map((c) => [c.month, parseFloat(c.total)]));
    const allExpenseMap = new Map(expenses.map((e) => [e.month, parseFloat(e.total)]));

    let runningBalance = 0;
    // Include all historical months before our 6-month window
    for (const [key, val] of allContribMap) {
      if (key < months[0].key) runningBalance += val;
    }
    for (const [key, val] of allExpenseMap) {
      if (key < months[0].key) runningBalance -= val;
    }

    return months.map((m) => {
      const monthContrib = allContribMap.get(m.key) ?? 0;
      const monthExpense = allExpenseMap.get(m.key) ?? 0;
      const savings = monthContrib - monthExpense;
      runningBalance += savings;
      return { month: m.key, balance: runningBalance, savings };
    });
  }

  private getLast6Months(): { key: string; start: Date }[] {
    const result: { key: string; start: Date }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        start: d,
      });
    }
    return result;
  }
}
