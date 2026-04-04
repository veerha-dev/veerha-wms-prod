import { ImportExportConfig } from '@/shared/lib/import-export/types';
import {
  required,
  isPositiveInteger,
  compose,
} from '@/shared/lib/import-export/validators';
import {
  toString,
  toInteger,
  nullIfEmpty,
} from '@/shared/lib/import-export/transformers';

export interface StockLevelData {
  id?: string;
  skuId?: string;
  skuCode: string;
  skuName?: string;
  warehouseId?: string;
  warehouseName?: string;
  binId?: string;
  binCode?: string;
  batchId?: string;
  batchNumber?: string;
  quantityAvailable: number;
  quantityReserved?: number;
  quantityInTransit?: number;
  quantityDamaged?: number;
  totalQuantity?: number;
  minStock?: number;
  maxStock?: number;
  lastUpdated?: string;
  createdAt?: string;
}

export const stockImportExportConfig: ImportExportConfig<StockLevelData> = {
  entityType: 'stock',
  entityLabel: 'Stock Levels',

  import: {
    requiredColumns: ['skuCode', 'warehouseCode', 'quantityAvailable'],
    optionalColumns: [
      'binCode',
      'batchNumber',
      'quantityReserved',
      'quantityInTransit',
      'quantityDamaged',
    ],
    columnMappings: {
      'SKU Code': 'skuCode',
      'SKU': 'skuCode',
      'Warehouse Code': 'warehouseCode',
      'Warehouse': 'warehouseCode',
      'Bin Code': 'binCode',
      'Bin': 'binCode',
      'Batch Number': 'batchNumber',
      'Batch': 'batchNumber',
      'Available Qty': 'quantityAvailable',
      'Available': 'quantityAvailable',
      'Quantity Available': 'quantityAvailable',
      'Qty Available': 'quantityAvailable',
      'Reserved Qty': 'quantityReserved',
      'Reserved': 'quantityReserved',
      'Quantity Reserved': 'quantityReserved',
      'In Transit Qty': 'quantityInTransit',
      'In Transit': 'quantityInTransit',
      'Quantity In Transit': 'quantityInTransit',
      'Damaged Qty': 'quantityDamaged',
      'Damaged': 'quantityDamaged',
      'Quantity Damaged': 'quantityDamaged',
    },
    validators: {
      skuCode: required,
      warehouseCode: required,
      quantityAvailable: compose(required, isPositiveInteger),
      quantityReserved: isPositiveInteger,
      quantityInTransit: isPositiveInteger,
      quantityDamaged: isPositiveInteger,
    },
    transformers: {
      skuCode: toString,
      warehouseCode: toString,
      binCode: nullIfEmpty,
      batchNumber: nullIfEmpty,
      quantityAvailable: toInteger,
      quantityReserved: toInteger,
      quantityInTransit: toInteger,
      quantityDamaged: toInteger,
    },
    batchSize: 100,
    templateFileName: 'stock-import-template.csv',
  },

  export: {
    columns: [
      { key: 'skuCode', label: 'SKU Code', width: 100 },
      { key: 'skuName', label: 'SKU Name', width: 200 },
      { key: 'warehouseName', label: 'Warehouse', width: 150 },
      { key: 'binCode', label: 'Bin Code', width: 100 },
      { key: 'batchNumber', label: 'Batch Number', width: 120 },
      { key: 'quantityAvailable', label: 'Available Qty', width: 100 },
      { key: 'quantityReserved', label: 'Reserved Qty', width: 100 },
      { key: 'quantityInTransit', label: 'In Transit Qty', width: 100 },
      { key: 'quantityDamaged', label: 'Damaged Qty', width: 100 },
      { key: 'totalQuantity', label: 'Total Qty', width: 100 },
      { key: 'minStock', label: 'Min Stock', width: 80 },
      { key: 'maxStock', label: 'Max Stock', width: 80 },
      { key: 'lastUpdated', label: 'Last Updated', width: 150 },
    ],
    defaultColumns: [
      'skuCode',
      'skuName',
      'warehouseName',
      'binCode',
      'quantityAvailable',
      'quantityReserved',
      'totalQuantity',
    ],
    formatters: {
      lastUpdated: (val) => (val ? new Date(val as string).toLocaleString() : ''),
      quantityAvailable: (val) => String(val ?? 0),
      quantityReserved: (val) => String(val ?? 0),
      quantityInTransit: (val) => String(val ?? 0),
      quantityDamaged: (val) => String(val ?? 0),
      totalQuantity: (val) => String(val ?? 0),
    },
    fileName: () => `stock-levels-export-${new Date().toISOString().split('T')[0]}.csv`,
  },

  api: {
    bulkCreate: '/api/v1/inventory/bulk',
    bulkUpdate: '/api/v1/inventory/bulk-update',
    export: '/api/v1/inventory/export',
  },
};
