import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, MaxLength } from 'class-validator';
import { ZoneType } from './create-zone.dto';

export class UpdateZoneDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsEnum(ZoneType)
  @IsOptional()
  type?: ZoneType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  capacityWeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  capacityVolume?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;
}
