import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() taskType?: string;
  @IsOptional() @IsString() task_type?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() instructions?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsUUID() assigned_to?: string;
  @IsOptional() @IsString() dueDate?: string;
  @IsOptional() @IsString() due_date?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsUUID() warehouse_id?: string;

  @IsOptional() @IsUUID() linkedSoId?: string;
  @IsOptional() @IsUUID() linked_so_id?: string;
  @IsOptional() @IsUUID() linkedGrnId?: string;
  @IsOptional() @IsUUID() linked_grn_id?: string;
  @IsOptional() @IsUUID() sourceBinId?: string;
  @IsOptional() @IsUUID() source_bin_id?: string;
  @IsOptional() @IsUUID() destinationBinId?: string;
  @IsOptional() @IsUUID() destination_bin_id?: string;
  @IsOptional() @IsUUID() zoneId?: string;
  @IsOptional() @IsUUID() zone_id?: string;
  @IsOptional() @IsUUID() rackId?: string;
  @IsOptional() @IsUUID() rack_id?: string;
  @IsOptional() @IsUUID() binId?: string;
  @IsOptional() @IsUUID() bin_id?: string;
  @IsOptional() @IsUUID() skuId?: string;
  @IsOptional() @IsUUID() sku_id?: string;
  @IsOptional() @IsString() countScope?: string;
  @IsOptional() @IsString() count_scope?: string;
  @IsOptional() @IsString() sourceLocation?: string;
  @IsOptional() @IsString() source_location?: string;
  @IsOptional() @IsString() recurrence?: string;
  @IsOptional() @IsString() repeatPattern?: string;
  @IsOptional() @IsString() daysOfWeek?: string;
}
