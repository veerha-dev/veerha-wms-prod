import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsEmail() email: string;
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() full_name?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() warehouseId?: string;
}
