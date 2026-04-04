import * as XLSX from 'xlsx';
import { ParseResult, ParsedRow, ValidationError, ImportConfig, ColumnMapping } from './types';
import { autoMapColumns } from './csv-parser';

export interface ExcelParseOptions {
  config: ImportConfig;
  columnMappings?: ColumnMapping[];
  sheetIndex?: number;
}

export async function parseExcel(file: File, options: ExcelParseOptions): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetIndex = options.sheetIndex || 0;
        const sheetName = workbook.SheetNames[sheetIndex];
        if (!sheetName) {
          reject(new Error('No sheets found in Excel file'));
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
          header: 1,
          raw: false,
          defval: '',
        }) as string[][];

        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }

        const headers = jsonData[0].map((h) => String(h).trim());
        const rows = jsonData.slice(1).map((row) => {
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = String(row[index] || '').trim();
          });
          return obj;
        });

        const parsed = processExcelResults(rows, headers, options);
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

function processExcelResults(
  data: Record<string, string>[],
  headers: string[],
  options: ExcelParseOptions
): ParseResult {
  const { config, columnMappings } = options;
  const mappings = columnMappings || autoMapColumns(headers, config);

  const rows: ParsedRow[] = data
    .filter((row) => Object.values(row).some((v) => v && v.trim() !== ''))
    .map((row, index) => {
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
    fileFormat: 'xlsx',
  };
}

export function getSheetNames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(new Error('Failed to read Excel sheets'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsArrayBuffer(file);
  });
}
