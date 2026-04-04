import { IsUUID, IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateDamagedItemDto {
  @IsUUID() skuId: string;
  @IsOptional() @IsUUID() batchId?: string;
  @IsNumber() quantity: number;
  @IsString() damageType: string;
  @IsString() description: string;
  @IsOptional() @IsArray() photos?: string[];
  @IsString() location: string;
  @IsOptional() @IsUUID() locationId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsString() disposition?: string;
}
