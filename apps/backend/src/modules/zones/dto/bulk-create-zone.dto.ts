import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, ValidateNested, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ZoneType } from './create-zone.dto';

export class BulkAisleConfig {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsNumber()
  @Min(0)
  rackCount: number;
}

export class BulkRackConfig {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsNumber()
  @Min(0)
  @Max(20)
  levels: number;

  @IsNumber()
  @Min(0)
  @Max(50)
  positionsPerLevel: number;

  @IsNumber()
  @IsOptional()
  aisleIndex?: number;
}

export class BulkCreateZoneDto {
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

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BulkAisleConfig)
  aisles?: BulkAisleConfig[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BulkRackConfig)
  racks?: BulkRackConfig[];
}
