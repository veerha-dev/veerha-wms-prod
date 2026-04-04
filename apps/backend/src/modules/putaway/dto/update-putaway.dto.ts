import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class UpdatePutawayDto {
  @IsOptional() @IsUUID() skuId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsUUID() grnId?: string;
  @IsOptional() @IsUUID() grnItemId?: string;
  @IsOptional() @IsUUID() batchId?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsUUID() sourceZoneId?: string;
  @IsOptional() @IsUUID() sourceBinId?: string;
  @IsOptional() @IsUUID() destinationZoneId?: string;
  @IsOptional() @IsUUID() destinationBinId?: string;
  @IsOptional() @IsUUID() suggestedBinId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
}
