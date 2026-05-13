import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class LayoutRackDto {
  @IsOptional() @IsString() name?: string;
  @IsInt() @Min(1) levels: number;
  @IsInt() @Min(1) positionsPerLevel: number;
}

export class LayoutAisleDto {
  @IsOptional() @IsString() name?: string;
  @IsInt() @Min(1) rackCount: number;
  @IsInt() @Min(1) levels: number;
  @IsInt() @Min(1) positionsPerLevel: number;
}

export class LayoutZoneDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() type: string;
  @IsOptional() @IsInt() @Min(0) aisleCount?: number;
  @IsInt() @Min(0) rackCount: number;
  @IsInt() @Min(1) levels: number;
  @IsInt() @Min(1) positionsPerLevel: number;
}

export class BulkLayoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayoutZoneDto)
  zones: LayoutZoneDto[];
}

export interface BulkLayoutResult {
  warehouseId: string;
  created: {
    zones: number;
    aisles: number;
    racks: number;
    bins: number;
  };
}
