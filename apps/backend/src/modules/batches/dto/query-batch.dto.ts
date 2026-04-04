import { IsOptional, IsString, IsNumber } from 'class-validator';

export class QueryBatchDto {
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() skuId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: string;
}
