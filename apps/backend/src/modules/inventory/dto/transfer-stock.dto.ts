import { IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

export class TransferStockDto {
  @IsUUID() skuId: string;
  @IsUUID() fromBinId: string;
  @IsUUID() toBinId: string;
  @IsNumber() @Min(1) quantity: number;
  @IsOptional() @IsUUID() batchId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
}
