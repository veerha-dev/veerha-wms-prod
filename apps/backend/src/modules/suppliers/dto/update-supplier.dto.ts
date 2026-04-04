import { IsString, IsOptional, IsEmail, IsInt, IsNumber, IsIn, Min, MaxLength } from 'class-validator';

export class UpdateSupplierDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() @MaxLength(255) name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;

  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsString() contact_person?: string;

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() address_line1?: string;

  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() country?: string;

  @IsOptional() @IsString() gstNumber?: string;
  @IsOptional() @IsString() gst_number?: string;

  @IsOptional() @IsNumber() paymentTerms?: number;
  @IsOptional() @IsString() payment_terms?: string;

  @IsOptional() @IsInt() @Min(0) leadTimeDays?: number;

  @IsOptional() @IsString() @IsIn(['active', 'inactive']) status?: string;
}
