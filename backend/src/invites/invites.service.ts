import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { randomUUID } from 'crypto';
import { Invite, InviteType } from './entities/invite.entity';
import { Pool } from '../pools/entities/pool.entity';
import { PoolMembership, MemberStatus } from '../pools/entities/pool-membership.entity';
import { User } from '../users/entities/user.entity';
import { CreateInviteDto } from './dto/create-invite.dto';

const INVITE_EXPIRY_DAYS = 7;

@Injectable()
export class InvitesService {
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepo: Repository<Invite>,
    @InjectRepository(Pool)
    private readonly poolRepo: Repository<Pool>,
    @InjectRepository(PoolMembership)
    private readonly membershipRepo: Repository<PoolMembership>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createInvite(poolId: string, userId: string, dto: CreateInviteDto): Promise<Invite> {
    const pool = await this.poolRepo.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Pool not found');
    if (pool.ownerId !== userId) throw new ForbiddenException('Only the pool owner can create invites');

    if (dto.type === InviteType.DIRECT) {
      if (!dto.inviteeId) throw new BadRequestException('inviteeId is required for direct invites');

      const invitee = await this.userRepo.findOne({ where: { id: dto.inviteeId } });
      if (!invitee) throw new NotFoundException('User not found');

      const existing = await this.membershipRepo.findOne({
        where: { poolId, userId: dto.inviteeId },
      });
      if (existing) throw new ConflictException('User is already a member');

      const existingInvite = await this.inviteRepo.findOne({
        where: {
          poolId,
          inviteeId: dto.inviteeId,
          type: InviteType.DIRECT,
          usedAt: undefined as any,
          expiresAt: MoreThan(new Date()),
        },
      });
      if (existingInvite) throw new ConflictException('User already has a pending invite');
    }

    const invite = this.inviteRepo.create({
      poolId,
      invitedBy: userId,
      token: randomUUID(),
      type: dto.type,
      inviteeId: dto.inviteeId || undefined,
      expiresAt: new Date(Date.now() + INVITE_EXPIRY_DAYS * 86400000),
    });

    return this.inviteRepo.save(invite) as Promise<Invite>;
  }

  async getInvites(poolId: string, userId: string): Promise<Invite[]> {
    const pool = await this.poolRepo.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Pool not found');
    if (pool.ownerId !== userId) throw new ForbiddenException('Only the pool owner can view invites');

    return this.inviteRepo.find({
      where: {
        poolId,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['invitee'],
      order: { createdAt: 'DESC' },
    });
  }

  async revokeInvite(poolId: string, inviteId: string, userId: string): Promise<void> {
    const pool = await this.poolRepo.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Pool not found');
    if (pool.ownerId !== userId) throw new ForbiddenException('Only the pool owner can revoke invites');

    const invite = await this.inviteRepo.findOne({ where: { id: inviteId, poolId } });
    if (!invite) throw new NotFoundException('Invite not found');

    await this.inviteRepo.remove(invite);
  }

  async getInvitePreview(token: string, userId: string) {
    const invite = await this.inviteRepo.findOne({
      where: { token },
      relations: ['pool', 'pool.owner'],
    });
    if (!invite) throw new NotFoundException('Invite not found');

    const expired = new Date(invite.expiresAt) < new Date();

    const existingMembership = await this.membershipRepo.findOne({
      where: { poolId: invite.poolId, userId, status: MemberStatus.ACTIVE },
    });

    const pendingMembership = await this.membershipRepo.findOne({
      where: { poolId: invite.poolId, userId, status: MemberStatus.PENDING },
    });

    return {
      pool: {
        id: invite.pool.id,
        name: invite.pool.name,
        description: invite.pool.description,
        icon: invite.pool.icon,
        color: invite.pool.color,
        owner: { name: invite.pool.owner.name },
      },
      expired,
      alreadyMember: !!existingMembership,
      alreadyPending: !!pendingMembership,
    };
  }

  async redeemInvite(token: string, userId: string): Promise<PoolMembership> {
    const invite = await this.inviteRepo.findOne({
      where: { token },
      relations: ['pool'],
    });
    if (!invite) throw new NotFoundException('Invite not found');
    if (new Date(invite.expiresAt) < new Date()) throw new BadRequestException('Invite has expired');

    if (invite.type === InviteType.DIRECT && invite.inviteeId !== userId) {
      throw new ForbiddenException('This invite is for another user');
    }

    const existing = await this.membershipRepo.findOne({
      where: { poolId: invite.poolId, userId },
    });
    if (existing) throw new ConflictException('You are already a member or have a pending request');

    const isDirectInvite = invite.type === InviteType.DIRECT;

    const membership = this.membershipRepo.create({
      poolId: invite.poolId,
      userId,
      role: invite.role,
      status: isDirectInvite ? MemberStatus.ACTIVE : MemberStatus.PENDING,
      canInvite: false,
      canEditCategories: false,
    });
    const saved = await this.membershipRepo.save(membership);

    if (isDirectInvite) {
      invite.usedAt = new Date();
      await this.inviteRepo.save(invite);
    }

    return saved;
  }

  async getPendingMembers(poolId: string, userId: string): Promise<PoolMembership[]> {
    const pool = await this.poolRepo.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Pool not found');
    if (pool.ownerId !== userId) throw new ForbiddenException('Only the pool owner can view pending members');

    return this.membershipRepo.find({
      where: { poolId, status: MemberStatus.PENDING },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async approveMember(poolId: string, targetUserId: string, ownerId: string): Promise<PoolMembership> {
    const pool = await this.poolRepo.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Pool not found');
    if (pool.ownerId !== ownerId) throw new ForbiddenException('Only the pool owner can approve members');

    const membership = await this.membershipRepo.findOne({
      where: { poolId, userId: targetUserId, status: MemberStatus.PENDING },
      relations: ['user'],
    });
    if (!membership) throw new NotFoundException('Pending membership not found');

    membership.status = MemberStatus.ACTIVE;
    return this.membershipRepo.save(membership);
  }

  async rejectMember(poolId: string, targetUserId: string, ownerId: string): Promise<void> {
    const pool = await this.poolRepo.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Pool not found');
    if (pool.ownerId !== ownerId) throw new ForbiddenException('Only the pool owner can reject members');

    const membership = await this.membershipRepo.findOne({
      where: { poolId, userId: targetUserId, status: MemberStatus.PENDING },
    });
    if (!membership) throw new NotFoundException('Pending membership not found');

    await this.membershipRepo.remove(membership);
  }

  async getMyInvitations(userId: string) {
    const invites = await this.inviteRepo.find({
      where: {
        type: InviteType.DIRECT,
        inviteeId: userId,
        usedAt: undefined as any,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['pool', 'inviter'],
      order: { createdAt: 'DESC' },
    });

    return invites
      .filter((i) => !i.usedAt)
      .map((i) => ({
        id: i.id,
        pool: {
          id: i.pool.id,
          name: i.pool.name,
          icon: i.pool.icon,
          color: i.pool.color,
        },
        invitedByUser: { name: i.inviter.name },
        createdAt: i.createdAt,
        token: i.token,
      }));
  }

  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    if (query.length < 3) return [];

    return this.userRepo
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .andWhere('(user.email ILIKE :q OR user.phone ILIKE :q OR user.name ILIKE :q)', {
        q: `%${query}%`,
      })
      .select(['user.id', 'user.name', 'user.email', 'user.phone', 'user.avatar'])
      .limit(20)
      .getMany();
  }
}
