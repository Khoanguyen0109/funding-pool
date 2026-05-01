import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(userId: string, partial: Partial<Pick<User, 'defaultPoolId'>>): Promise<void> {
    await this.usersRepository.update(userId, partial);
  }

  /** Clears default pool preference for any user pointing at this pool (soft-delete does not fire FK ON DELETE). */
  async clearDefaultPoolReferencing(poolId: string): Promise<void> {
    await this.usersRepository.update({ defaultPoolId: poolId }, { defaultPoolId: null });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async findByPhoneWithPassword(phone: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.phone = :phone', { phone })
      .getOne();
  }

  async findByOAuth(provider: string, oauthId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { oauthProvider: provider, oauthId },
    });
  }

  async createWithPassword(data: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
  }): Promise<User> {
    if (data.email) {
      const existing = await this.findByEmail(data.email);
      if (existing) throw new ConflictException('Email already in use');
    }

    if (data.phone) {
      const existing = await this.findByPhone(data.phone);
      if (existing) throw new ConflictException('Phone number already in use');
    }

    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async findOrCreateFromOAuth(data: {
    email: string;
    name: string;
    avatar?: string;
    oauthProvider: string;
    oauthId: string;
  }): Promise<User> {
    let user = await this.findByOAuth(data.oauthProvider, data.oauthId);

    if (!user) {
      user = await this.findByEmail(data.email);
      if (user) {
        user.oauthProvider = data.oauthProvider;
        user.oauthId = data.oauthId;
        if (data.avatar) user.avatar = data.avatar;
        return this.usersRepository.save(user);
      }
    }

    if (!user) {
      user = this.usersRepository.create(data);
      return this.usersRepository.save(user);
    }

    return user;
  }
}
