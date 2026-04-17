import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { InviteType } from '../entities/invite.entity';

export class CreateInviteDto {
  @IsEnum(InviteType)
  type: InviteType;

  @IsOptional()
  @IsUUID()
  inviteeId?: string;
}
