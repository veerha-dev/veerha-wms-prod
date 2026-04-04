import { Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { ColumnMapping } from '@/shared/lib/import-export/types';

interface ColumnMappingTableProps {
  mappings: ColumnMapping[];
  availableHeaders: string[];
  onMappingChange: (targetField: string, sourceColumn: string) => void;
  className?: string;
}

export function ColumnMappingTable({
  mappings,
  availableHeaders,
  onMappingChange,
  className,
}: ColumnMappingTableProps) {
  const requiredMappings = mappings.filter((m) => m.isRequired);
  const optionalMappings = mappings.filter((m) => !m.isRequired);

  const unmappedRequired = requiredMappings.filter((m) => !m.isMatched);

  return (
    <div className={cn('space-y-4', className)}>
      {unmappedRequired.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            {unmappedRequired.length} required field(s) not mapped:{' '}
            {unmappedRequired.map((m) => m.targetField).join(', ')}
          </span>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Target Field</th>
              <th className="px-4 py-3 text-left font-medium">Source Column</th>
              <th className="px-4 py-3 text-center font-medium w-20">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requiredMappings.length > 0 && (
              <>
                <tr className="bg-muted/30">
                  <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    Required Fields
                  </td>
                </tr>
                {requiredMappings.map((mapping) => (
                  <MappingRow
                    key={mapping.targetField}
                    mapping={mapping}
                    availableHeaders={availableHeaders}
                    onMappingChange={onMappingChange}
                  />
                ))}
              </>
            )}

            {optionalMappings.length > 0 && (
              <>
                <tr className="bg-muted/30">
                  <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    Optional Fields
                  </td>
                </tr>
                {optionalMappings.map((mapping) => (
                  <MappingRow
                    key={mapping.targetField}
                    mapping={mapping}
                    availableHeaders={availableHeaders}
                    onMappingChange={onMappingChange}
                  />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface MappingRowProps {
  mapping: ColumnMapping;
  availableHeaders: string[];
  onMappingChange: (targetField: string, sourceColumn: string) => void;
}

function MappingRow({ mapping, availableHeaders, onMappingChange }: MappingRowProps) {
  return (
    <tr className={cn(!mapping.isMatched && mapping.isRequired && 'bg-destructive/5')}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">{mapping.targetField}</span>
          {mapping.isRequired && (
            <Badge variant="outline" className="text-xs">
              Required
            </Badge>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Select
          value={mapping.sourceColumn || '__none__'}
          onValueChange={(value) =>
            onMappingChange(mapping.targetField, value === '__none__' ? '' : value)
          }
        >
          <SelectTrigger className="w-full max-w-[250px]">
            <SelectValue placeholder="Select column..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">
              <span className="text-muted-foreground">-- Not mapped --</span>
            </SelectItem>
            {availableHeaders.map((header) => (
              <SelectItem key={header} value={header}>
                {header}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3 text-center">
        {mapping.isMatched ? (
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10">
            <Check className="h-4 w-4 text-success" />
          </div>
        ) : (
          <div
            className={cn(
              'inline-flex items-center justify-center w-6 h-6 rounded-full',
              mapping.isRequired ? 'bg-destructive/10' : 'bg-muted'
            )}
          >
            <X
              className={cn(
                'h-4 w-4',
                mapping.isRequired ? 'text-destructive' : 'text-muted-foreground'
              )}
            />
          </div>
        )}
      </td>
    </tr>
  );
}
