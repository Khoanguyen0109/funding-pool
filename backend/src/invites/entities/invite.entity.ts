import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Pool } from '../../pools/entities/pool.entity';
import { MemberRole } from '../../pools/entities/pool-membership.entity';

export enum InviteType {
  LINK = 'link',
  DIRECT = 'direct',
}

@Entity('invites')
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pool_id' })
  poolId: string;

  @ManyToOne(() => Pool, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pool_id' })
  pool: Pool;

  @Column({ name: 'invited_by' })
  invitedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invited_by' })
  inviter: User;

  @Column({ unique: true })
  token: string;

  @Column({ type: 'enum', enum: InviteType, default: InviteType.LINK })
  type: InviteType;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @Column({ name: 'invitee_id', nullable: true })
  inviteeId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invitee_id' })
  invitee: User;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'used_at', nullable: true })
  usedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
