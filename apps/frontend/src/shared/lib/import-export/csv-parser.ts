import Papa from 'papaparse';
import { ParseResult, ParsedRow, ValidationError, ImportConfig, ColumnMapping } from './types';

export interface CsvParseOptions {
  config: ImportConfig;
  columnMappings?: ColumnMapping[];
}

export function parseCSV(file: File, options: CsvParseOptions): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          const parsed = processParseResults(results.data as Record<string, string>[], results.meta.fields || [], options);
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

export function parseCSVString(csvString: string, options: CsvParseOptions): ParseResult {
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  return processParseResults(results.data as Record<string, string>[], results.meta.fields || [], options);
}

function processParseResults(
  data: Record<string, string>[],
  headers: string[],
  options: CsvParseOptions
): ParseResult {
  const { config, columnMappings } = options;
  const mappings = columnMappings || autoMapColumns(headers, config);

  const rows: ParsedRow[] = data.map((row, index) => {
    const mappedData: Record<string, string> = {};
    const errors: ValidationError[] = [];

    for (const mapping of mappings) {
      if (mapping.isMatched) {
        const value = row[mapping.sourceColumn] || '';
        mappedData[mapping.targetField] = value;

        const validator = config.validators[mapping.targetField];
        if (validator) {
          const error = validator(value, row);
          if (error) {
            errors.push({
              field: mapping.targetField,
              message: error,
              value,
            });
          }
        }
      }
    }

    for (const requiredField of config.requiredColumns) {
      if (!mappedData[requiredField] || mappedData[requiredField].trim() === '') {
        const existingError = errors.find((e) => e.field === requiredField);
        if (!existingError) {
          errors.push({
            field: requiredField,
            message: 'This field is required',
            value: '',
          });
        }
      }
    }

    return {
      rowIndex: index + 1,
      data: mappedData,
      errors,
      isValid: errors.length === 0,
    };
  });

  const validRows = rows.filter((r) => r.isValid).length;

  return {
    headers,
    rows,
    totalRows: rows.length,
    validRows,
    invalidRows: rows.length - validRows,
    fileFormat: 'csv',
  };
}

export function autoMapColumns(headers: string[], config: ImportConfig): ColumnMapping[] {
  const allFields = [...config.requiredColumns, ...config.optionalColumns];
  const mappings: ColumnMapping[] = [];

  for (const field of allFields) {
    const isRequired = config.requiredColumns.includes(field);
    let matchedHeader: string | null = null;

    for (const [csvHeader, targetField] of Object.entries(config.columnMappings)) {
      if (targetField === field) {
        const foundHeader = headers.find(
          (h) => h.toLowerCase().trim() === csvHeader.toLowerCase().trim()
        );
        if (foundHeader) {
          matchedHeader = foundHeader;
          break;
        }
      }
    }

    if (!matchedHeader) {
      matchedHeader = headers.find(
        (h) => h.toLowerCase().trim() === field.toLowerCase().trim()
      ) || null;
    }

    mappings.push({
      sourceColumn: matchedHeader || '',
      targetField: field,
      isRequired,
      isMatched: !!matchedHeader,
    });
  }

  return mappings;
}

export function validateMappings(mappings: ColumnMapping[], config: ImportConfig): string[] {
  const errors: string[] = [];

  for (const required of config.requiredColumns) {
    const mapping = mappings.find((m) => m.targetField === required);
    if (!mapping || !mapping.isMatched) {
      errors.push(`Required field "${required}" is not mapped to any column`);
    }
  }

  return errors;
}

export function transformRow(
  row: Record<string, string>,
  config: ImportConfig
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(row)) {
    const transformer = config.transformers[field];
    transformed[field] = transformer ? transformer(value, row) : value;
  }

  return transformed;
}

export function transformRows(
  rows: ParsedRow[],
  config: ImportConfig
): Record<string, unknown>[] {
  return rows
    .filter((row) => row.isValid)
    .map((row) => transformRow(row.data, config));
}
