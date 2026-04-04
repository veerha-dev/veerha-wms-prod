import { ImportExportConfig } from '@/shared/lib/import-export/types';
import {
  required,
  isPositiveNumber,
  isPositiveInteger,
  isBoolean,
  oneOf,
  compose,
} from '@/shared/lib/import-export/validators';
import {
  toString,
  toFloat,
  toInteger,
  toBoolean,
  nullIfEmpty,
  defaultValue,
} from '@/shared/lib/import-export/transformers';

const categories = [
  'Food & Grocery',
  'Electronics',
  'Kitchenware',
  'Cleaning',
  'Textiles',
  'Auto Parts',
  'Pharma',
  'Industrial',
  'general',
  'electronics',
];

const statuses = ['active', 'inactive', 'blocked', 'discontinued'];
const units = ['pcs', 'kg', 'ltr', 'bags', 'rolls', 'boxes', 'packs', 'sets', 'nos', 'strips', 'UNITS'];

export interface SKUData {
  id?: string;
  code: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  uom: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  barcode?: string;
  hsnCode?: string;
  gstRate?: number;
  costPrice?: number;
  sellingPrice?: number;
  reorderPoint?: number;
  reorderQty?: number;
  minStock?: number;
  maxStock?: number;
  batchTracking?: boolean;
  expiryTracking?: boolean;
  serialTracking?: boolean;
  shelfLifeDays?: number;
  storageType?: string;
  hazardous?: boolean;
  fragile?: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export const skuImportExportConfig: ImportExportConfig<SKUData> = {
  entityType: 'sku',
  entityLabel: 'SKUs',

  import: {
    requiredColumns: ['name', 'category', 'uom'],
    optionalColumns: [
      'code',
      'subcategory',
      'brand',
      'description',
      'weight',
      'length',
      'width',
      'height',
      'barcode',
      'hsnCode',
      'gstRate',
      'costPrice',
      'sellingPrice',
      'reorderPoint',
      'reorderQty',
      'minStock',
      'maxStock',
      'batchTracking',
      'expiryTracking',
      'serialTracking',
      'shelfLifeDays',
      'storageType',
      'hazardous',
      'fragile',
      'status',
    ],
    columnMappings: {
      'SKU Code': 'code',
      'Code': 'code',
      'Product Name': 'name',
      'Name': 'name',
      'Category': 'category',
      'Sub Category': 'subcategory',
      'Subcategory': 'subcategory',
      'Brand': 'brand',
      'Description': 'description',
      'Unit': 'uom',
      'UOM': 'uom',
      'Weight': 'weight',
      'Weight (kg)': 'weight',
      'Length': 'length',
      'Length (cm)': 'length',
      'Width': 'width',
      'Width (cm)': 'width',
      'Height': 'height',
      'Height (cm)': 'height',
      'Barcode': 'barcode',
      'HSN Code': 'hsnCode',
      'HSN': 'hsnCode',
      'GST Rate': 'gstRate',
      'GST %': 'gstRate',
      'Cost Price': 'costPrice',
      'Cost': 'costPrice',
      'Selling Price': 'sellingPrice',
      'Price': 'sellingPrice',
      'Reorder Point': 'reorderPoint',
      'Reorder Qty': 'reorderQty',
      'Reorder Quantity': 'reorderQty',
      'Min Stock': 'minStock',
      'Minimum Stock': 'minStock',
      'Max Stock': 'maxStock',
      'Maximum Stock': 'maxStock',
      'Batch Tracking': 'batchTracking',
      'Expiry Tracking': 'expiryTracking',
      'Serial Tracking': 'serialTracking',
      'Shelf Life Days': 'shelfLifeDays',
      'Shelf Life': 'shelfLifeDays',
      'Storage Type': 'storageType',
      'Hazardous': 'hazardous',
      'Fragile': 'fragile',
      'Status': 'status',
    },
    validators: {
      name: required,
      category: compose(required, oneOf(categories, false)),
      uom: compose(required, oneOf(units, false)),
      weight: isPositiveNumber,
      length: isPositiveNumber,
      width: isPositiveNumber,
      height: isPositiveNumber,
      gstRate: isPositiveNumber,
      costPrice: isPositiveNumber,
      sellingPrice: isPositiveNumber,
      reorderPoint: isPositiveInteger,
      reorderQty: isPositiveInteger,
      minStock: isPositiveInteger,
      maxStock: isPositiveInteger,
      shelfLifeDays: isPositiveInteger,
      batchTracking: isBoolean,
      expiryTracking: isBoolean,
      serialTracking: isBoolean,
      hazardous: isBoolean,
      fragile: isBoolean,
      status: oneOf(statuses, false),
    },
    transformers: {
      name: toString,
      category: toString,
      subcategory: nullIfEmpty,
      brand: nullIfEmpty,
      description: nullIfEmpty,
      uom: (val) => val?.toLowerCase() || 'pcs',
      weight: toFloat,
      length: toFloat,
      width: toFloat,
      height: toFloat,
      barcode: nullIfEmpty,
      hsnCode: nullIfEmpty,
      gstRate: toFloat,
      costPrice: toFloat,
      sellingPrice: toFloat,
      reorderPoint: toInteger,
      reorderQty: toInteger,
      minStock: toInteger,
      maxStock: toInteger,
      batchTracking: toBoolean,
      expiryTracking: toBoolean,
      serialTracking: toBoolean,
      shelfLifeDays: toInteger,
      storageType: (val) => defaultValue('ambient')(val),
      hazardous: toBoolean,
      fragile: toBoolean,
      status: (val) => defaultValue('active')(val),
    },
    batchSize: 100,
    templateFileName: 'sku-import-template.csv',
  },

  export: {
    columns: [
      { key: 'code', label: 'SKU Code', width: 100 },
      { key: 'name', label: 'Product Name', width: 200 },
      { key: 'category', label: 'Category', width: 120 },
      { key: 'subcategory', label: 'Sub Category', width: 120 },
      { key: 'brand', label: 'Brand', width: 100 },
      { key: 'description', label: 'Description', width: 200 },
      { key: 'uom', label: 'Unit', width: 60 },
      { key: 'weight', label: 'Weight (kg)', width: 80 },
      { key: 'length', label: 'Length (cm)', width: 80 },
      { key: 'width', label: 'Width (cm)', width: 80 },
      { key: 'height', label: 'Height (cm)', width: 80 },
      { key: 'barcode', label: 'Barcode', width: 120 },
      { key: 'hsnCode', label: 'HSN Code', width: 100 },
      { key: 'gstRate', label: 'GST %', width: 60 },
      { key: 'costPrice', label: 'Cost Price', width: 100 },
      { key: 'sellingPrice', label: 'Selling Price', width: 100 },
      { key: 'reorderPoint', label: 'Reorder Point', width: 100 },
      { key: 'reorderQty', label: 'Reorder Qty', width: 100 },
      { key: 'minStock', label: 'Min Stock', width: 80 },
      { key: 'maxStock', label: 'Max Stock', width: 80 },
      { key: 'batchTracking', label: 'Batch Tracking', width: 100 },
      { key: 'expiryTracking', label: 'Expiry Tracking', width: 100 },
      { key: 'hazardous', label: 'Hazardous', width: 80 },
      { key: 'fragile', label: 'Fragile', width: 80 },
      { key: 'status', label: 'Status', width: 80 },
    ],
    defaultColumns: [
      'code',
      'name',
      'category',
      'uom',
      'costPrice',
      'sellingPrice',
      'minStock',
      'maxStock',
      'status',
    ],
    formatters: {
      costPrice: (val) => (val != null ? Number(val).toFixed(2) : ''),
      sellingPrice: (val) => (val != null ? Number(val).toFixed(2) : ''),
      gstRate: (val) => (val != null ? Number(val).toFixed(2) : ''),
      weight: (val) => (val != null ? Number(val).toFixed(3) : ''),
      batchTracking: (val) => (val ? 'Yes' : 'No'),
      expiryTracking: (val) => (val ? 'Yes' : 'No'),
      hazardous: (val) => (val ? 'Yes' : 'No'),
      fragile: (val) => (val ? 'Yes' : 'No'),
      status: (val) => String(val || '').toUpperCase(),
    },
    fileName: () => `skus-export-${new Date().toISOString().split('T')[0]}.csv`,
  },

  api: {
    bulkCreate: '/api/v1/skus/bulk',
    bulkUpdate: '/api/v1/skus/bulk-update',
    export: '/api/v1/skus/export',
  },

  sampleData: [
    {
      name: 'Sample Product',
      category: 'Electronics',
      uom: 'pcs',
      costPrice: 100,
      sellingPrice: 150,
      minStock: 10,
      maxStock: 100,
      status: 'active',
    },
  ],
};
