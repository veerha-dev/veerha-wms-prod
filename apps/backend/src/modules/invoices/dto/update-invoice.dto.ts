import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceItemDto } from './create-invoice.dto';

export class UpdateInvoiceDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsUUID() soId?: string;
  @IsOptional() @IsUUID() poId?: string;
  @IsOptional() @IsUUID() grnId?: string;
  @IsOptional() @IsUUID() shipmentId?: string;
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsUUID() supplierId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() subtotal?: number;
  @IsOptional() @IsNumber() taxAmount?: number;
  @IsOptional() @IsNumber() totalAmount?: number;
  @IsOptional() @IsNumber() paidAmount?: number;
  @IsOptional() @IsString() invoiceDate?: string;
  @IsOptional() @IsString() dueDate?: string;
  @IsOptional() @IsNumber() paymentTerms?: number;
  @IsOptional() @IsString() gstType?: string;
  @IsOptional() @IsNumber() cgstAmount?: number;
  @IsOptional() @IsNumber() sgstAmount?: number;
  @IsOptional() @IsNumber() igstAmount?: number;
  @IsOptional() @IsNumber() discountAmount?: number;
  @IsOptional() @IsString() billingPeriodStart?: string;
  @IsOptional() @IsString() billingPeriodEnd?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateInvoiceItemDto)
  items?: CreateInvoiceItemDto[];
}
