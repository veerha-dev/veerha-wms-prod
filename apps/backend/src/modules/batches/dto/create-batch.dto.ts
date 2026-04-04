import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsEnum } from 'class-validator';

export enum BatchStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  QUARANTINE = 'quarantine',
  EXPIRED = 'expired',
  CONSUMED = 'consumed',
  DEPLETED = 'depleted',
}

export class CreateBatchDto {
  @IsUUID() skuId: string;
  @IsString() batchNumber: string;
  @IsOptional() @IsDateString() manufactureDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsString() supplierReference?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsEnum(BatchStatus) status?: BatchStatus;
}
