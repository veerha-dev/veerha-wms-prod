import { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { ParseResult, ParsedRow } from '@/shared/lib/import-export/types';

interface ValidationResultsProps {
  parseResult: ParseResult;
  maxPreviewRows?: number;
  className?: string;
}

export function ValidationResults({
  parseResult,
  maxPreviewRows = 10,
  className,
}: ValidationResultsProps) {
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const invalidRows = parseResult.rows.filter((r) => !r.isValid);
  const displayErrors = showAllErrors ? invalidRows : invalidRows.slice(0, 5);

  const toggleRowExpand = (rowIndex: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-2xl font-bold">{parseResult.totalRows}</p>
          <p className="text-sm text-muted-foreground">Total Rows</p>
        </div>
        <div className="p-4 rounded-lg bg-success/10 text-center">
          <p className="text-2xl font-bold text-success">{parseResult.validRows}</p>
          <p className="text-sm text-muted-foreground">Valid Rows</p>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 text-center">
          <p className="text-2xl font-bold text-destructive">{parseResult.invalidRows}</p>
          <p className="text-sm text-muted-foreground">Invalid Rows</p>
        </div>
      </div>

      {parseResult.invalidRows > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Validation Errors
            </h4>
            {invalidRows.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllErrors(!showAllErrors)}
              >
                {showAllErrors ? 'Show Less' : `Show All (${invalidRows.length})`}
              </Button>
            )}
          </div>

          <ScrollArea className="h-[200px] border rounded-lg">
            <div className="p-2 space-y-2">
              {displayErrors.map((row) => (
                <ErrorRow
                  key={row.rowIndex}
                  row={row}
                  isExpanded={expandedRows.has(row.rowIndex)}
                  onToggle={() => toggleRowExpand(row.rowIndex)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {parseResult.validRows > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Preview (First {Math.min(maxPreviewRows, parseResult.validRows)} valid rows)
          </h4>

          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="h-[200px]">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Row</th>
                    {Object.keys(parseResult.rows[0]?.data || {}).map((field) => (
                      <th key={field} className="px-3 py-2 text-left font-medium">
                        {field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {parseResult.rows
                    .filter((r) => r.isValid)
                    .slice(0, maxPreviewRows)
                    .map((row) => (
                      <tr key={row.rowIndex} className="hover:bg-muted/30">
                        <td className="px-3 py-2 text-muted-foreground">{row.rowIndex}</td>
                        {Object.values(row.data).map((value, idx) => (
                          <td key={idx} className="px-3 py-2 truncate max-w-[150px]">
                            {value || <span className="text-muted-foreground">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}

interface ErrorRowProps {
  row: ParsedRow;
  isExpanded: boolean;
  onToggle: () => void;
}

function ErrorRow({ row, isExpanded, onToggle }: ErrorRowProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Badge variant="destructive" className="text-xs">
            Row {row.rowIndex}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {row.errors.length} error{row.errors.length > 1 ? 's' : ''}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {row.errors.map((error, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-sm p-2 rounded bg-destructive/5"
            >
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">{error.field}:</span>{' '}
                <span className="text-muted-foreground">{error.message}</span>
                {error.value && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (value: "{error.value}")
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
