import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum } from 'class-validator';

export enum SKUStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  DISCONTINUED = 'discontinued',
}

export class CreateSkuDto {
  @IsOptional() @IsString() code?: string;
  @IsString() name: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() subcategory?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() uom?: string;
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsNumber() length?: number;
  @IsOptional() @IsNumber() width?: number;
  @IsOptional() @IsNumber() height?: number;
  @IsOptional() @IsString() barcode?: string;
  @IsOptional() @IsString() hsnCode?: string;
  @IsOptional() @IsNumber() gstRate?: number;
  @IsOptional() @IsNumber() costPrice?: number;
  @IsOptional() @IsNumber() sellingPrice?: number;
  @IsOptional() @IsNumber() reorderPoint?: number;
  @IsOptional() @IsNumber() reorderQty?: number;
  @IsOptional() @IsNumber() minStock?: number;
  @IsOptional() @IsNumber() maxStock?: number;
  @IsOptional() @IsBoolean() batchTracking?: boolean;
  @IsOptional() @IsBoolean() expiryTracking?: boolean;
  @IsOptional() @IsBoolean() serialTracking?: boolean;
  @IsOptional() @IsNumber() shelfLifeDays?: number;
  @IsOptional() @IsString() storageType?: string;
  @IsOptional() @IsBoolean() hazardous?: boolean;
  @IsOptional() @IsBoolean() fragile?: boolean;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsEnum(SKUStatus) status?: SKUStatus;
  @IsOptional() @IsString() imageUrl?: string;
}
