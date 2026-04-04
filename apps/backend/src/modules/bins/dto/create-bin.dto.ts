import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, Min, MaxLength } from 'class-validator';

export enum BinStatus {
  EMPTY = 'empty',
  PARTIAL = 'partial',
  FULL = 'full',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
}

export class CreateBinDto {
  @IsString()
  @IsNotEmpty()
  rackId: string;

  @IsString()
  @IsNotEmpty()
  zoneId: string;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  level: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  position: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  capacity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxWeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxVolume?: number;

  @IsEnum(BinStatus)
  @IsOptional()
  status?: BinStatus;
}
