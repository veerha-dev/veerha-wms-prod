import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateMovementDto {
  @IsString() movementType: string;
  @IsUUID() skuId: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsUUID() fromBinId?: string;
  @IsOptional() @IsUUID() toBinId?: string;
  @IsOptional() @IsUUID() batchId?: string;
  @IsNumber() @Min(1) quantity: number;
  @IsOptional() @IsString() referenceType?: string;
  @IsOptional() @IsString() referenceId?: string;
  @IsOptional() @IsString() notes?: string;
}
