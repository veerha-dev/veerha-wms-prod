import { IsUUID, IsNumber, IsString, IsOptional } from 'class-validator';

export class AdjustStockDto {
  @IsUUID() skuId: string;
  @IsUUID() binId: string;
  @IsNumber() quantity: number; // positive = add, negative = remove
  @IsString() reason: string; // damage, correction, scrap, cycle_count, etc.
  @IsOptional() @IsUUID() batchId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsString() notes?: string;
}
