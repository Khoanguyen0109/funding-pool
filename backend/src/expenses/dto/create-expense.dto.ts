import { IsNumber, IsString, IsUUID, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  description: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
