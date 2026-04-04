import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min, Max, MaxLength } from 'class-validator';

export enum RackStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  MAINTENANCE = 'maintenance',
}

export class CreateRackDto {
  @IsString()
  @IsNotEmpty()
  zoneId: string;

  @IsString()
  @IsOptional()
  aisleId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

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
