import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateSerialStatusDto {
  @IsString() status: string;
  @IsOptional() @IsUUID() soId?: string;
  @IsOptional() @IsUUID() pickListId?: string;
  @IsOptional() @IsUUID() shipmentId?: string;
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsUUID() binId?: string;
  @IsOptional() @IsUUID() zoneId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
}
