import { IsString, IsOptional, IsUUID } from 'class-validator';
export class UpdateTaskDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
}
