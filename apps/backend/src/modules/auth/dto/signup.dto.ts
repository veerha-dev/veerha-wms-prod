import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  companyName?: string;
}
