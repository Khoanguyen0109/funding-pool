import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PoolMembership } from '../../pools/entities/pool-membership.entity';
import { Pool } from '../../pools/entities/pool.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'oauth_provider', nullable: true })
  oauthProvider: string;

  @Column({ name: 'oauth_id', nullable: true })
  oauthId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Pool, (pool) => pool.owner)
  ownedPools: Pool[];

  @OneToMany(() => PoolMembership, (membership) => membership.user)
  memberships: PoolMembership[];

  @Column({ name: 'default_pool_id', nullable: true })
  defaultPoolId: string | null;

  /** BCP 47 locale for date/time and number formatting; defaults to Vietnam. */
  @Column({ nullable: true, default: 'vi-VN' })
  locale: string | null;

  @ManyToOne(() => Pool, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'default_pool_id' })
  defaultPool: Pool | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}
