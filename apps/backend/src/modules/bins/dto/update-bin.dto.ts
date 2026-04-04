import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, MaxLength } from 'class-validator';
import { BinStatus } from './create-bin.dto';

export class UpdateBinDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  level?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  position?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  capacity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxWeight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxVolume?: number;

  @IsEnum(BinStatus)
  @IsOptional()
  status?: BinStatus;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @IsString()
  @IsOptional()
  lockReason?: string;
}
