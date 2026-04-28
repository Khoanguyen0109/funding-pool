import { IsOptional, IsUUID } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsUUID()
  defaultPoolId?: string | null;
}
