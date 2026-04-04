import { IsString, IsOptional, IsUUID, IsArray, IsNotEmpty } from 'class-validator';

export class CreateSerialDto {
  @IsString() @IsNotEmpty() serialNumber: string;
  @IsUUID() skuId: string;
  @IsOptional() @IsUUID() batchId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsUUID() zoneId?: string;
  @IsOptional() @IsUUID() binId?: string;
  @IsOptional() @IsUUID() grnId?: string;
  @IsOptional() @IsUUID() grnItemId?: string;
  @IsOptional() @IsUUID() poId?: string;
  @IsOptional() @IsUUID() supplierId?: string;
}

export class BulkCreateSerialsDto {
  @IsArray() serialNumbers: string[];
  @IsUUID() skuId: string;
  @IsOptional() @IsUUID() batchId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsUUID() grnId?: string;
  @IsOptional() @IsUUID() grnItemId?: string;
  @IsOptional() @IsUUID() poId?: string;
  @IsOptional() @IsUUID() supplierId?: string;
}
