import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDamagedItemDto {
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) limit?: number = 50;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() skuId?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() disposition?: string;
  @IsOptional() @IsString() damageType?: string;
  @IsOptional() @IsString() sortBy?: string = 'created_at';
  @IsOptional() @IsString() sortOrder?: string = 'DESC';
}
