import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsOptional() @IsString() itemType?: string;
  @IsOptional() @IsUUID() skuId?: string;
  @IsOptional() @IsString() skuCode?: string;
  @IsOptional() @IsString() skuName?: string;
  @IsOptional() @IsString() hsnCode?: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber() @Min(0) quantity: number;
  @IsNumber() @Min(0) unitPrice: number;
  @IsOptional() @IsNumber() discountPercent?: number;
  @IsOptional() @IsNumber() taxRate?: number;
}

export class CreateInvoiceDto {
  @IsOptional() @IsString() invoiceNumber?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsUUID() supplierId?: string;
  @IsOptional() @IsUUID() soId?: string;
  @IsOptional() @IsUUID() salesOrderId?: string;
  @IsOptional() @IsUUID() poId?: string;
  @IsOptional() @IsUUID() grnId?: string;
  @IsOptional() @IsUUID() shipmentId?: string;
  @IsOptional() @IsUUID() warehouseId?: string;
  @IsOptional() @IsString() invoiceDate?: string;
  @IsOptional() @IsString() dueDate?: string;
  @IsOptional() @IsNumber() paymentTerms?: number;
  @IsOptional() @IsString() gstType?: string;
  @IsOptional() @IsString() billingPeriodStart?: string;
  @IsOptional() @IsString() billingPeriodEnd?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() subtotal?: number;
  @IsOptional() @IsNumber() taxAmount?: number;
  @IsOptional() @IsNumber() totalAmount?: number;
  @IsOptional() @IsNumber() paidAmount?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateInvoiceItemDto)
  items?: CreateInvoiceItemDto[];
}
