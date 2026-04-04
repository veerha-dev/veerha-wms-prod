import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, Min, MaxLength } from 'class-validator';

export enum ZoneType {
  RECEIVING = 'receiving',
  STORAGE = 'storage',
  PICKING = 'picking',
  PACKING = 'packing',
  SHIPPING = 'shipping',
  RETURNS = 'returns',
  STAGING = 'staging',
  COLD_STORAGE = 'cold-storage',
  HAZARDOUS = 'hazardous',
  BULK = 'bulk',
  FAST_MOVING = 'fast-moving',
}

export class CreateZoneDto {
  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

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
}
