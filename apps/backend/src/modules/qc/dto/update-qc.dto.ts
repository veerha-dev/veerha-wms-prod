import { IsString, IsOptional, IsUUID } from 'class-validator';
export class UpdateQcDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
}
