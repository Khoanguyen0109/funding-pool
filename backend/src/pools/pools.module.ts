import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from './entities/pool.entity';
import { PoolMembership } from './entities/pool-membership.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { UsersModule } from '../users/users.module';
import { PoolsService } from './pools.service';
import { PoolsController } from './pools.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pool, PoolMembership, Contribution, Expense]), UsersModule],
  providers: [PoolsService],
  controllers: [PoolsController],
  exports: [PoolsService],
})
export class PoolsModule {}
