import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateReturnDto {
  @IsOptional() @IsString() order_reference?: string;
  @IsOptional() @IsUUID() so_id?: string;
  @IsOptional() @IsUUID() soId?: string;
  @IsOptional() @IsUUID() customer_id?: string;
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsUUID() warehouse_id?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsString() sku_id?: string;
  @IsOptional() @IsString() skuId?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() condition?: string;
  @IsOptional() @IsString() notes?: string;
}
