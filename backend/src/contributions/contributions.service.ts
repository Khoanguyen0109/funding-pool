import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from './entities/contribution.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,
  ) {}

  async findByPool(poolId: string): Promise<Contribution[]> {
    return this.contributionRepo.find({
      where: { poolId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(poolId: string, userId: string, dto: CreateContributionDto): Promise<Contribution> {
    const contribution = this.contributionRepo.create({
      ...dto,
      poolId,
      userId,
    });
    const saved = await this.contributionRepo.save(contribution);
    return this.contributionRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    }) as Promise<Contribution>;
  }
}
