import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsArray, ValidateNested, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
  @IsOptional() @IsUUID() skuId?: string;
  @IsOptional() @IsUUID() sku_id?: string;
  @IsOptional() @IsNumber() @Min(1) quantity?: number;
  @IsOptional() @IsNumber() @Min(0) unitCost?: number;
  @IsOptional() @IsNumber() @Min(0) unitPrice?: number;
  @IsOptional() @IsNumber() @Min(0) unit_price?: number;
  @IsOptional() @IsString() notes?: string;
}

export class CreatePurchaseOrderDto {
  // Accept both camelCase and snake_case
  @IsOptional() @IsUUID() supplierId?: string;
  @IsOptional() @IsUUID() supplier_id?: string;

  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsUUID() warehouse_id?: string;

  @IsOptional() @IsDateString() expectedDate?: string;
  @IsOptional() @IsDateString() expected_date?: string;

  @IsOptional() @IsNumber() @Min(0) totalAmount?: number;
  @IsOptional() @IsNumber() @Min(0) total_amount?: number;

  @IsOptional() @IsString() @MaxLength(1000) notes?: string;

  @IsOptional() @IsUUID() created_by?: string;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PurchaseOrderItemDto)
  items?: PurchaseOrderItemDto[];
}
