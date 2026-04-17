import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoolsService } from './pools.service';
import { CreatePoolDto } from './dto/create-pool.dto';
import { User } from '../users/entities/user.entity';

@Controller('pools')
@UseGuards(JwtAuthGuard)
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get()
  findAll(@Req() req: any) {
    const user = req.user as User;
    return this.poolsService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const user = req.user as User;
    return this.poolsService.findByIdForUser(id, user.id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreatePoolDto) {
    const user = req.user as User;
    return this.poolsService.create(user.id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const user = req.user as User;
    await this.poolsService.remove(id, user.id);
    return { deleted: true };
  }

  @Get(':id/transactions')
  async getTransactions(@Param('id') id: string, @Req() req: any) {
    const user = req.user as User;
    return this.poolsService.getTransactions(id, user.id);
  }
}
