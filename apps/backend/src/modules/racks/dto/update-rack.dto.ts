import { IsString, IsOptional, IsNumber, IsEnum, Min, Max, MaxLength } from 'class-validator';
import { RackStatus } from './create-rack.dto';

export class UpdateRackDto {
  @IsString()
  @IsOptional()
  aisleId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  rowPosition?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  columnPosition?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(20)
  levels?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  slotsPerLevel?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxWeightKg?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxVolumeM3?: number;

  @IsEnum(RackStatus)
  @IsOptional()
  status?: RackStatus;
}
