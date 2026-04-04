import { ImportExportConfig } from '@/shared/lib/import-export/types';
import {
  required,
  isDate,
  isPositiveInteger,
  oneOf,
  compose,
} from '@/shared/lib/import-export/validators';
import {
  toString,
  toInteger,
  toDateOnly,
  nullIfEmpty,
  defaultValue,
} from '@/shared/lib/import-export/transformers';

const statuses = ['active', 'blocked', 'quarantine', 'expired', 'consumed', 'depleted'];

export interface BatchData {
  id?: string;
  skuId: string;
  skuCode?: string;
  skuName?: string;
  batchNumber: string;
  manufactureDate?: string;
  expiryDate?: string;
  supplierReference?: string;
  quantity?: number;
  status: string;
  fifoRank?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const batchImportExportConfig: ImportExportConfig<BatchData> = {
  entityType: 'batch',
  entityLabel: 'Batches',

  import: {
    requiredColumns: ['skuCode', 'batchNumber'],
    optionalColumns: [
      'manufactureDate',
      'expiryDate',
      'supplierReference',
      'quantity',
      'status',
      'fifoRank',
    ],
    columnMappings: {
      'SKU Code': 'skuCode',
      'SKU': 'skuCode',
      'Batch Number': 'batchNumber',
      'Batch': 'batchNumber',
      'Batch No': 'batchNumber',
      'Manufacture Date': 'manufactureDate',
      'Mfg Date': 'manufactureDate',
      'Manufacturing Date': 'manufactureDate',
      'Expiry Date': 'expiryDate',
      'Expiry': 'expiryDate',
      'Exp Date': 'expiryDate',
      'Supplier Reference': 'supplierReference',
      'Supplier Ref': 'supplierReference',
      'Quantity': 'quantity',
      'Qty': 'quantity',
      'Status': 'status',
      'FIFO Rank': 'fifoRank',
    },
    validators: {
      skuCode: required,
      batchNumber: required,
      manufactureDate: isDate,
      expiryDate: isDate,
      quantity: isPositiveInteger,
      status: oneOf(statuses, false),
      fifoRank: isPositiveInteger,
    },
    transformers: {
      skuCode: toString,
      batchNumber: toString,
      manufactureDate: toDateOnly,
      expiryDate: toDateOnly,
      supplierReference: nullIfEmpty,
      quantity: toInteger,
      status: (val) => defaultValue('active')(val),
      fifoRank: toInteger,
    },
    batchSize: 100,
    templateFileName: 'batch-import-template.csv',
  },

  export: {
    columns: [
      { key: 'skuCode', label: 'SKU Code', width: 100 },
      { key: 'skuName', label: 'SKU Name', width: 200 },
      { key: 'batchNumber', label: 'Batch Number', width: 120 },
      { key: 'manufactureDate', label: 'Manufacture Date', width: 120 },
      { key: 'expiryDate', label: 'Expiry Date', width: 120 },
      { key: 'supplierReference', label: 'Supplier Reference', width: 150 },
      { key: 'quantity', label: 'Quantity', width: 80 },
      { key: 'status', label: 'Status', width: 100 },
      { key: 'fifoRank', label: 'FIFO Rank', width: 80 },
      { key: 'createdAt', label: 'Created At', width: 150 },
    ],
    defaultColumns: [
      'skuCode',
      'skuName',
      'batchNumber',
      'manufactureDate',
      'expiryDate',
      'quantity',
      'status',
    ],
    formatters: {
      manufactureDate: (val) => (val ? new Date(val as string).toLocaleDateString() : ''),
      expiryDate: (val) => (val ? new Date(val as string).toLocaleDateString() : ''),
      createdAt: (val) => (val ? new Date(val as string).toLocaleString() : ''),
      status: (val) => String(val || '').toUpperCase(),
    },
    fileName: () => `batches-export-${new Date().toISOString().split('T')[0]}.csv`,
  },

  api: {
    bulkCreate: '/api/v1/batches/bulk',
    bulkUpdate: '/api/v1/batches/bulk-update',
    export: '/api/v1/batches/export',
  },
};
