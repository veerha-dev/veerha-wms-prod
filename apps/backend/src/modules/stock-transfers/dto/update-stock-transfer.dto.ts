import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class UpdateStockTransferDto {
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() reason?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() status?: string;
}
