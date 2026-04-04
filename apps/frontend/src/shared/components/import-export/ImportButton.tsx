import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button, ButtonProps } from '@/shared/components/ui/button';
import { ImportDialog } from './ImportDialog';
import { ImportExportConfig, BulkImportResult } from '@/shared/lib/import-export/types';

interface ImportButtonProps extends Omit<ButtonProps, 'onClick'> {
  config: ImportExportConfig;
  onImportComplete?: (result: BulkImportResult) => void;
}

export function ImportButton({
  config,
  onImportComplete,
  children,
  ...buttonProps
}: ImportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        {...buttonProps}
      >
        <Upload className="h-4 w-4 mr-2" />
        {children || 'Import'}
      </Button>

      <ImportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        config={config}
        onImportComplete={onImportComplete}
      />
    </>
  );
}
