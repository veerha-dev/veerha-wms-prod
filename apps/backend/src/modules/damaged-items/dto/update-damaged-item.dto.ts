import { IsOptional, IsString } from 'class-validator';

export class UpdateDamagedItemDto {
  @IsOptional() @IsString() disposition?: string;
  @IsOptional() description?: string;
  @IsOptional() photos?: string[];
  @IsOptional() decidedBy?: string;
  @IsOptional() decidedAt?: Date;
}
