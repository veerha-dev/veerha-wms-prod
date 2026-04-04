import { IsString, IsOptional, IsUUID } from 'class-validator';
export class UpdatePickListDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
}
