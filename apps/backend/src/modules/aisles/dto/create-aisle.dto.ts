import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateAisleDto {
  @IsString()
  @IsNotEmpty()
  zoneId: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
