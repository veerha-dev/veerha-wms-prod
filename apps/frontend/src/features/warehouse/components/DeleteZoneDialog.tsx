import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  zoneName: string;
  zoneCode: string;
  hasRacks: boolean;
  rackCount: number;
}

export function DeleteZoneDialog({
  open,
  onOpenChange,
  onConfirm,
  zoneName,
  zoneCode,
  hasRacks,
  rackCount,
}: DeleteZoneDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Zone</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left pt-2">
            Are you sure you want to delete the zone{' '}
            <span className="font-semibold text-foreground">"{zoneName}"</span>{' '}
            ({zoneCode})?
            
            {hasRacks && (
              <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ This zone contains {rackCount} rack{rackCount !== 1 ? 's' : ''} and all associated bins.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  All racks and bins within this zone will also be deleted. This action cannot be undone.
                </p>
              </div>
            )}
            
            {!hasRacks && (
              <p className="mt-2 text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete Zone
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
