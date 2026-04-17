import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoolsService } from '../pools/pools.service';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { User } from '../users/entities/user.entity';

@Controller('pools/:poolId/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly poolsService: PoolsService,
  ) {}

  @Get()
  async findAll(@Param('poolId') poolId: string, @Req() req: any) {
    const user = req.user as User;
    await this.poolsService.requireMembership(poolId, user.id);
    return this.expensesService.findByPool(poolId);
  }

  @Post()
  async create(
    @Param('poolId') poolId: string,
    @Body() dto: CreateExpenseDto,
    @Req() req: any,
  ) {
    const user = req.user as User;
    await this.poolsService.requireMembership(poolId, user.id);
    return this.expensesService.create(poolId, user.id, dto);
  }
}
