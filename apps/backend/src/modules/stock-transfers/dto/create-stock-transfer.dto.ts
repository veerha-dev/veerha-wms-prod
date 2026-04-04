import { IsString, IsOptional, IsUUID, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateStockTransferDto {
  @IsString() @IsNotEmpty() transferType: string;
  @IsOptional() @IsUUID() sourceWarehouseId?: string;
  @IsOptional() @IsUUID() sourceZoneId?: string;
  @IsOptional() @IsUUID() sourceRackId?: string;
  @IsOptional() @IsUUID() sourceBinId?: string;
  @IsOptional() @IsUUID() destWarehouseId?: string;
  @IsOptional() @IsUUID() destZoneId?: string;
  @IsOptional() @IsUUID() destRackId?: string;
  @IsOptional() @IsUUID() destBinId?: string;
  @IsOptional() @IsUUID() skuId?: string;
  @IsNumber() @Min(1) quantity: number;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() notes?: string;
}
