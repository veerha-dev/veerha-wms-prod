import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { FileFormat } from '@/shared/lib/import-export/types';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: FileFormat[];
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

const formatConfig: Record<FileFormat, { label: string; extensions: string[]; mimeTypes: string[] }> = {
  csv: {
    label: 'CSV',
    extensions: ['.csv'],
    mimeTypes: ['text/csv', 'application/vnd.ms-excel'],
  },
  xlsx: {
    label: 'Excel',
    extensions: ['.xlsx', '.xls'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
  },
};

export function FileUploadZone({
  onFileSelect,
  acceptedFormats = ['csv', 'xlsx'],
  maxSizeMB = 10,
  disabled = false,
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const acceptedExtensions = acceptedFormats.flatMap((f) => formatConfig[f].extensions);
  const acceptedMimeTypes = acceptedFormats.flatMap((f) => formatConfig[f].mimeTypes);
  const acceptString = [...acceptedExtensions, ...acceptedMimeTypes].join(',');

  const validateFile = useCallback(
    (file: File): string | null => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedExtensions.includes(extension)) {
        return `Invalid file type. Accepted: ${acceptedExtensions.join(', ')}`;
      }

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        return `File too large. Maximum size: ${maxSizeMB}MB`;
      }

      return null;
    },
    [acceptedExtensions, maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return <FileText className="h-8 w-8 text-green-500" />;
    return <FileSpreadsheet className="h-8 w-8 text-emerald-500" />;
  };

  return (
    <div className={cn('w-full', className)}>
      {!selectedFile ? (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-destructive'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={acceptString}
            onChange={handleInputChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>

            <div>
              <p className="text-sm font-medium">
                Drag and drop your file here, or{' '}
                <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: {acceptedFormats.map((f) => formatConfig[f].label).join(', ')}
                {' • '}Max size: {maxSizeMB}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-4">
            {getFileIcon(selectedFile.name)}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={clearFile}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
