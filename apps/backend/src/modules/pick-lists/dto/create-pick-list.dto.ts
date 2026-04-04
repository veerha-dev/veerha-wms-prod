import { IsString, IsOptional, IsUUID, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePickListDto {
  @IsOptional() @IsString() strategy?: string;
  @IsOptional() @IsArray() orderIds?: string[];
  @IsOptional() @IsUUID() soId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(2) @Max(50) batchSize?: number;
  @IsOptional() @IsUUID() waveId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() name?: string;
}

export class GeneratePickListDto {
  @IsString() strategy: string;
  @IsArray() orderIds: string[];
  @IsUUID() warehouseId: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @Type(() => Number) @IsNumber() batchSize?: number;
  @IsOptional() @IsString() notes?: string;
}
