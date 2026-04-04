import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
export class QuerySalesOrderDto {
  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() sort?: string;
  @IsOptional() @IsString() order?: string;
}
