import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSkuDto } from './create-sku.dto';

export class BulkCreateSkuDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkuDto)
  items: CreateSkuDto[];
}

export class BulkImportResultDto {
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}
