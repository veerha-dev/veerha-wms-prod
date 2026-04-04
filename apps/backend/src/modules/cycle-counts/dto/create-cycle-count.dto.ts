import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateCycleCountDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsString() @IsNotEmpty() countScope: string;
  @IsOptional() @IsUUID() zoneId?: string;
  @IsOptional() @IsUUID() rackId?: string;
  @IsOptional() @IsUUID() binId?: string;
  @IsOptional() @IsUUID() skuId?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() scheduledDate?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() instructions?: string;
}
