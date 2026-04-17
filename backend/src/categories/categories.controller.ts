import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoolsService } from '../pools/pools.service';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { User } from '../users/entities/user.entity';

@Controller('pools/:poolId/categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly poolsService: PoolsService,
  ) {}

  @Get()
  async findAll(@Param('poolId') poolId: string, @Req() req: any) {
    const user = req.user as User;
    await this.poolsService.requireMembership(poolId, user.id);
    return this.categoriesService.findByPool(poolId);
  }

  @Post()
  async create(
    @Param('poolId') poolId: string,
    @Body() dto: CreateCategoryDto,
    @Req() req: any,
  ) {
    const user = req.user as User;
    await this.poolsService.requireMembership(poolId, user.id);
    return this.categoriesService.create(poolId, dto);
  }
}
