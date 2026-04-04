import { IsOptional, IsString, IsNumber } from 'class-validator';

export class QueryInventoryDto {
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() skuId?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() binId?: string;
  @IsOptional() @IsString() batchId?: string;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: string;
}

export class QueryMovementsDto {
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() skuId?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() movementType?: string;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: string;
}
