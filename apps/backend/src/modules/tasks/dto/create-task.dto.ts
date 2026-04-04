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
}
