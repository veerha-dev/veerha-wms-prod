import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { BatchStatus } from './create-batch.dto';

export class UpdateBatchDto {
  @IsOptional() @IsString() batchNumber?: string;
  @IsOptional() @IsDateString() manufactureDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsString() supplierReference?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsEnum(BatchStatus) status?: BatchStatus;
}
