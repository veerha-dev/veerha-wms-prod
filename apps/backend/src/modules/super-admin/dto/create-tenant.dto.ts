import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsIn,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;

  @IsString()
  @IsNotEmpty()
  adminName: string;

  @IsString()
  @IsOptional()
  planCode?: string;

  @IsString()
  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  billingCycle?: 'monthly' | 'yearly';

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
