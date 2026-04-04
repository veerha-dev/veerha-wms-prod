import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCK = 'overstock',
  EXPIRY = 'expiry',
  DAMAGED = 'damaged',
  REORDER = 'reorder',
  SYSTEM = 'system',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class CreateAlertDto {
  @IsEnum(AlertType) type: AlertType;
  @IsEnum(AlertSeverity) severity: AlertSeverity;
  @IsString() title: string;
  @IsOptional() @IsString() message?: string;
  @IsOptional() @IsUUID() skuId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
}
