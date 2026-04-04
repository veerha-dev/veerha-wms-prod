import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateQcDto {
  @IsOptional() @IsUUID() grnId?: string;
  @IsOptional() @IsUUID() grn_id?: string;
  @IsOptional() @IsUUID() skuId?: string;
  @IsOptional() @IsUUID() sku_id?: string;
  @IsOptional() @IsString() batchNumber?: string;
  @IsOptional() @IsString() batch_number?: string;
  @IsOptional() @IsString() notes?: string;
}
