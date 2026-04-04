import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPickListDto {
  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() strategy?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() sort?: string;
  @IsOptional() @IsString() order?: string;
}
