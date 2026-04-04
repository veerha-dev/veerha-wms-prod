import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

interface DataStateProps {
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function DataState({
  isLoading,
  error,
  isEmpty,
  emptyMessage = 'No data found',
  emptyIcon,
  onRetry,
  children,
}: DataStateProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-destructive mb-3" />
          <p className="text-sm font-medium text-destructive mb-1">Something went wrong</p>
          <p className="text-xs text-muted-foreground mb-4">{error.message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          {emptyIcon || <Inbox className="h-8 w-8 text-muted-foreground mb-3" />}
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
