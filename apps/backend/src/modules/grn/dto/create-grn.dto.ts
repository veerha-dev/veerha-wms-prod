import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateGrnDto {
  @IsOptional() @IsUUID() poId?: string;
  @IsOptional() @IsUUID() purchase_order_id?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsUUID() warehouse_id?: string;
  @IsOptional() @IsString() receivedDate?: string;
  @IsOptional() @IsString() received_date?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() dockDoor?: string;
  @IsOptional() @IsString() dock_door?: string;
  @IsOptional() @IsString() vehicleNumber?: string;
  @IsOptional() @IsString() vehicle_number?: string;
}
