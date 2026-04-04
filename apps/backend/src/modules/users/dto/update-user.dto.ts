import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() full_name?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() warehouseId?: string;
}
