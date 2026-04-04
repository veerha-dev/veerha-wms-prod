import { IsString, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';

export enum AdjustmentType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  DAMAGE = 'damage',
  CORRECTION = 'correction',
  WRITE_OFF = 'write_off',
}

export enum AdjustmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class CreateAdjustmentDto {
  @IsOptional() @IsString() adjustmentNumber?: string;
  @IsEnum(AdjustmentType) type: AdjustmentType;
  @IsUUID() skuId: string;
  @IsUUID() warehouseId: string;
  @IsOptional() @IsUUID() binId?: string;
  @IsNumber() quantity: number;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsUUID() requestedBy?: string;
  @IsOptional() @IsString() notes?: string;
}
