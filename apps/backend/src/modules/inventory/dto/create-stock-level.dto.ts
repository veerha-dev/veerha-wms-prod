import { IsUUID, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateStockLevelDto {
  @IsUUID() skuId: string;
  @IsUUID() warehouseId: string;
  @IsOptional() @IsUUID() binId?: string;
  @IsOptional() @IsUUID() batchId?: string;
  @IsOptional() @IsNumber() @Min(0) quantityAvailable?: number;
  @IsOptional() @IsNumber() @Min(0) quantityReserved?: number;
  @IsOptional() @IsNumber() @Min(0) quantityInTransit?: number;
  @IsOptional() @IsNumber() @Min(0) quantityDamaged?: number;
}
