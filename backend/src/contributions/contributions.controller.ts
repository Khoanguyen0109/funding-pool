import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoolsService } from '../pools/pools.service';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { User } from '../users/entities/user.entity';

@Controller('pools/:poolId/contributions')
@UseGuards(JwtAuthGuard)
export class ContributionsController {
  constructor(
    private readonly contributionsService: ContributionsService,
    private readonly poolsService: PoolsService,
  ) {}

  @Get()
  async findAll(@Param('poolId') poolId: string, @Req() req: any) {
    const user = req.user as User;
    await this.poolsService.requireMembership(poolId, user.id);
    return this.contributionsService.findByPool(poolId);
  }

  @Post()
  async create(
    @Param('poolId') poolId: string,
    @Body() dto: CreateContributionDto,
    @Req() req: any,
  ) {
    const user = req.user as User;
    await this.poolsService.requireMembership(poolId, user.id);
    return this.contributionsService.create(poolId, user.id, dto);
  }
}
