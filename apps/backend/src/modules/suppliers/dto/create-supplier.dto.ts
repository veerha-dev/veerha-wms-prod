import { IsString, IsOptional, IsEmail, IsInt, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @IsOptional() @IsString() code?: string;

  @IsString() @MaxLength(255) name: string;

  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(20) phone?: string;

  // Accept both camelCase and snake_case
  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsString() contact_person?: string;

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() addressLine1?: string;
  @IsOptional() @IsString() address_line1?: string;

  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() postal_code?: string;
  @IsOptional() @IsString() country?: string;

  @IsOptional() @IsString() gstNumber?: string;
  @IsOptional() @IsString() gst_number?: string;

  @IsOptional() @IsNumber() paymentTerms?: number;
  @IsOptional() @IsString() payment_terms?: string;

  @IsOptional() @IsInt() @Min(0) leadTimeDays?: number;
  @IsOptional() @IsInt() @Min(0) lead_time_days?: number;

  @IsOptional() @IsString() status?: string;
}
