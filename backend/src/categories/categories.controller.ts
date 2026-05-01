import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoolsService } from '../pools/pools.service';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
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

  @Patch(':categoryId')
  async update(
    @Param('poolId') poolId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: any,
  ) {
    const user = req.user as User;
    await this.poolsService.requireMembership(poolId, user.id);
    return this.categoriesService.update(categoryId, poolId, dto);
  }

  @Delete(':categoryId')
  async remove(
    @Param('poolId') poolId: string,
    @Param('categoryId') categoryId: string,
    @Req() req: any,
  ) {
    const user = req.user as User;
    await this.poolsService.requireMembership(poolId, user.id);
    return this.categoriesService.softDelete(categoryId, poolId);
  }
}
