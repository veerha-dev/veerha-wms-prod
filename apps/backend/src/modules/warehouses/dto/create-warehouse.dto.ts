import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsEmail,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['distribution', 'manufacturing', 'cold_storage', 'bonded', 'transit', 'retail'])
  type?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  addressLine1: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsInt()
  @Min(0)
  totalCapacity: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalAreaSqft?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['active', 'inactive', 'maintenance'])
  status?: string;
}
