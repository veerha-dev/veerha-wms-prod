import { IsString, IsOptional, IsUUID } from 'class-validator';
export class UpdateSalesOrderDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
}
