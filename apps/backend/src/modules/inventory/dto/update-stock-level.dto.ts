import { IsOptional, IsNumber } from 'class-validator';

export class UpdateStockLevelDto {
  @IsOptional() @IsNumber() quantityAvailable?: number;
  @IsOptional() @IsNumber() quantityReserved?: number;
  @IsOptional() @IsNumber() quantityInTransit?: number;
  @IsOptional() @IsNumber() quantityDamaged?: number;
}
