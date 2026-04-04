import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';

export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsUUID()
  supplier_id?: string;

  @IsOptional()
  @IsUUID()
  warehouse_id?: string;

  @IsOptional()
  @IsDateString()
  expected_date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
