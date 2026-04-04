export type FileFormat = 'csv' | 'xlsx';

export interface ParsedRow {
  rowIndex: number;
  data: Record<string, string>;
  errors: ValidationError[];
  isValid: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

export interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  fileFormat: FileFormat;
}

export type ValidatorFn = (value: string, row?: Record<string, string>) => string | null;
export type TransformerFn = (value: string, row?: Record<string, string>) => unknown;
export type FormatterFn = (value: unknown) => string;

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  isRequired: boolean;
  isMatched: boolean;
}

export interface ImportConfig {
  requiredColumns: string[];
  optionalColumns: string[];
  columnMappings: Record<string, string>;
  validators: Record<string, ValidatorFn>;
  transformers: Record<string, TransformerFn>;
  batchSize: number;
  templateFileName?: string;
}

export interface ExportConfig {
  columns: ExportColumn[];
  defaultColumns: string[];
  formatters: Record<string, FormatterFn>;
  fileName: (filters?: Record<string, unknown>) => string;
}

export interface ImportExportConfig<T = unknown> {
  entityType: string;
  entityLabel: string;
  import: ImportConfig;
  export: ExportConfig;
  api: {
    bulkCreate: string;
    bulkUpdate?: string;
    export?: string;
  };
  sampleData?: Partial<T>[];
}

export interface ImportProgress {
  stage: 'idle' | 'uploading' | 'parsing' | 'validating' | 'mapping' | 'importing' | 'complete' | 'error';
  progress: number;
  message: string;
  processedRows?: number;
  totalRows?: number;
  successCount?: number;
  errorCount?: number;
  errors?: Array<{ row: number; message: string }>;
}

export interface ExportProgress {
  stage: 'idle' | 'fetching' | 'generating' | 'downloading' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface BulkImportResult {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}
