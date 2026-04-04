import { IsArray, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class BulkUpdateSkuItemDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  uom?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  hsnCode?: string;

  @IsOptional()
  @IsNumber()
  gstRate?: number;

  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  sellingPrice?: number;

  @IsOptional()
  @IsNumber()
  reorderPoint?: number;

  @IsOptional()
  @IsNumber()
  reorderQty?: number;

  @IsOptional()
  @IsNumber()
  minStock?: number;

  @IsOptional()
  @IsNumber()
  maxStock?: number;

  @IsOptional()
  @IsBoolean()
  batchTracking?: boolean;

  @IsOptional()
  @IsBoolean()
  expiryTracking?: boolean;

  @IsOptional()
  @IsBoolean()
  serialTracking?: boolean;

  @IsOptional()
  @IsNumber()
  shelfLifeDays?: number;

  @IsOptional()
  @IsString()
  storageType?: string;

  @IsOptional()
  @IsBoolean()
  hazardous?: boolean;

  @IsOptional()
  @IsBoolean()
  fragile?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}

export class BulkUpdateSkuDto {
  @IsArray()
  items: BulkUpdateSkuItemDto[];
}
