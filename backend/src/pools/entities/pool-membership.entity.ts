import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Pool } from './pool.entity';

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum MemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
}

@Entity('pool_memberships')
@Unique(['userId', 'poolId'])
export class PoolMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'pool_id' })
  poolId: string;

  @ManyToOne(() => Pool, (pool) => pool.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pool_id' })
  pool: Pool;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus;

  @Column({
    name: 'max_spend_without_approval',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  maxSpendWithoutApproval: number;

  @Column({ name: 'can_invite', default: false })
  canInvite: boolean;

  @Column({ name: 'can_edit_categories', default: false })
  canEditCategories: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
