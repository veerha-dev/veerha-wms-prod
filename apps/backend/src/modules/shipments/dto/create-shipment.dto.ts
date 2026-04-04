import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateShipmentDto {
  @IsOptional() @IsUUID() order_id?: string;
  @IsOptional() @IsUUID() soId?: string;
  @IsOptional() @IsUUID() so_id?: string;
  @IsOptional() @IsUUID() warehouse_id?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsString() carrier_name?: string;
  @IsOptional() @IsString() carrier?: string;
  @IsOptional() @IsString() tracking_number?: string;
  @IsOptional() @IsString() trackingNumber?: string;
  @IsOptional() @IsString() vehicle_number?: string;
  @IsOptional() @IsString() driver_name?: string;
  @IsOptional() @IsString() driver_contact?: string;
  @IsOptional() @IsNumber() total_packages?: number;
  @IsOptional() @IsNumber() total_weight?: number;
  @IsOptional() @IsNumber() weight?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() shipping_address?: string;
}
