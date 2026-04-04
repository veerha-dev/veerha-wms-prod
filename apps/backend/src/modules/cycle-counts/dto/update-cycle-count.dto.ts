import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateCycleCountDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsString() scheduledDate?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() instructions?: string;
  @IsOptional() @IsString() status?: string;
}
