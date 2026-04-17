import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(1)
  name: string;

  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @MinLength(6)
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
