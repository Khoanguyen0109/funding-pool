import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PoolMembership } from './pool-membership.entity';
import { Category } from '../../categories/entities/category.entity';
import { Contribution } from '../../contributions/entities/contribution.entity';
import { Expense } from '../../expenses/entities/expense.entity';

export enum PoolType {
  PRIVATE = 'private',
  SHARED = 'shared',
}

@Entity('pools')
export class Pool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: '💰' })
  icon: string;

  @Column({ default: '#6C5CE7' })
  color: string;

  @Column({ default: 'VND', length: 3 })
  currency: string;

  @Column({ type: 'enum', enum: PoolType, default: PoolType.PRIVATE })
  type: PoolType;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.ownedPools)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'require_approval', default: false })
  requireApproval: boolean;

  @Column({ name: 'approval_threshold', type: 'decimal', precision: 12, scale: 2, nullable: true })
  approvalThreshold: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => PoolMembership, (membership) => membership.pool)
  members: PoolMembership[];

  @OneToMany(() => Category, (category) => category.pool)
  categories: Category[];

  @OneToMany(() => Contribution, (contribution) => contribution.pool)
  contributions: Contribution[];

  @OneToMany(() => Expense, (expense) => expense.pool)
  expenses: Expense[];
}
