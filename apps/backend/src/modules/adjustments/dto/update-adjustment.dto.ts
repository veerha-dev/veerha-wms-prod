import { IsString, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { AdjustmentType } from './create-adjustment.dto';

export class UpdateAdjustmentDto {
  @IsOptional() @IsEnum(AdjustmentType) type?: AdjustmentType;
  @IsOptional() @IsUUID() skuId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsUUID() binId?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() notes?: string;
}
