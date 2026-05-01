import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { SUPPORTED_DATETIME_LOCALES } from '../../common/constants/supported-datetime-locales';

export class UpdateMeDto {
  @IsOptional()
  @IsUUID()
  defaultPoolId?: string | null;

  @IsOptional()
  @IsIn([...SUPPORTED_DATETIME_LOCALES])
  locale?: string;
}
