import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class CreateContributionDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  transactionDate?: string;
}
