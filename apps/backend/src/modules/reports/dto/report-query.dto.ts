import { IsOptional, IsString, IsNumber } from 'class-validator';

export class ReportQueryDto {
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsNumber() limit?: number;
}
