import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsNumber()
  @Min(0)
  budgetAmount: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
