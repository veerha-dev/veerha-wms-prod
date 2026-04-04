import { Loader2, CheckCircle2, XCircle, Upload, FileSearch, ClipboardCheck, Database } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Progress } from '@/shared/components/ui/progress';
import { ImportProgress, ExportProgress } from '@/shared/lib/import-export/types';

interface ImportProgressTrackerProps {
  progress: ImportProgress;
  className?: string;
}

const importStages = [
  { key: 'uploading', label: 'Uploading', icon: Upload },
  { key: 'parsing', label: 'Parsing', icon: FileSearch },
  { key: 'validating', label: 'Validating', icon: ClipboardCheck },
  { key: 'importing', label: 'Importing', icon: Database },
];

export function ImportProgressTracker({ progress, className }: ImportProgressTrackerProps) {
  const currentStageIndex = importStages.findIndex((s) => s.key === progress.stage);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between gap-2">
        {importStages.map((stage, index) => {
          const Icon = stage.icon;
          const isComplete = index < currentStageIndex || progress.stage === 'complete';
          const isCurrent = index === currentStageIndex;
          const isError = progress.stage === 'error' && index === currentStageIndex;

          return (
            <div key={stage.key} className="flex-1">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isComplete && 'bg-success/10 text-success',
                    isCurrent && !isError && 'bg-primary/10 text-primary',
                    isError && 'bg-destructive/10 text-destructive',
                    !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isError ? (
                    <XCircle className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    (isComplete || isCurrent) && !isError && 'text-foreground',
                    isError && 'text-destructive',
                    !isComplete && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {stage.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {progress.stage !== 'idle' && progress.stage !== 'complete' && progress.stage !== 'error' && (
        <div className="space-y-2">
          <Progress value={progress.progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">{progress.message}</p>
        </div>
      )}

      {progress.stage === 'importing' && progress.processedRows !== undefined && (
        <div className="text-center text-sm text-muted-foreground">
          Processing row {progress.processedRows} of {progress.totalRows}
        </div>
      )}

      {progress.stage === 'complete' && (
        <div className="p-4 rounded-lg bg-success/10 text-center">
          <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="font-medium text-success">Import Complete!</p>
          <p className="text-sm text-muted-foreground mt-1">
            {progress.successCount} records imported successfully
            {progress.errorCount && progress.errorCount > 0 && (
              <>, {progress.errorCount} failed</>
            )}
          </p>
        </div>
      )}

      {progress.stage === 'error' && (
        <div className="p-4 rounded-lg bg-destructive/10 text-center">
          <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="font-medium text-destructive">Import Failed</p>
          <p className="text-sm text-muted-foreground mt-1">{progress.message}</p>
        </div>
      )}
    </div>
  );
}

interface ExportProgressTrackerProps {
  progress: ExportProgress;
  className?: string;
}

export function ExportProgressTracker({ progress, className }: ExportProgressTrackerProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {progress.stage !== 'idle' && progress.stage !== 'complete' && progress.stage !== 'error' && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">{progress.message}</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>
      )}

      {progress.stage === 'complete' && (
        <div className="p-4 rounded-lg bg-success/10 text-center">
          <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="font-medium text-success">Export Complete!</p>
          <p className="text-sm text-muted-foreground mt-1">Your file has been downloaded.</p>
        </div>
      )}

      {progress.stage === 'error' && (
        <div className="p-4 rounded-lg bg-destructive/10 text-center">
          <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="font-medium text-destructive">Export Failed</p>
          <p className="text-sm text-muted-foreground mt-1">{progress.message}</p>
        </div>
      )}
    </div>
  );
}
