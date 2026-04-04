
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

type DBWarehouse = any;

interface DeleteWarehouseDialogProps {
  warehouse: DBWarehouse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export function DeleteWarehouseDialog({
  warehouse,
  open,
  onOpenChange,
  onDelete,
}: DeleteWarehouseDialogProps) {
  if (!warehouse) return null;

  const usedCap = (warehouse as any).currentOccupancy ?? warehouse.used_capacity ?? 0;
  const totalCap = (warehouse as any).totalCapacity ?? warehouse.total_capacity ?? 0;
  const hasInventory = usedCap > 0;
  const utilization = totalCap > 0 
    ? Math.round((usedCap / totalCap) * 100) 
    : 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Godown?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{warehouse.name}"? This action cannot be undone.
            {hasInventory && (
              <span className="block mt-2 text-destructive font-medium">
                ⚠️ Warning: This godown has {utilization}% capacity utilized. 
                Please move or dispose of inventory before deleting.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={hasInventory}
          >
            {hasInventory ? 'Cannot Delete (Has Inventory)' : 'Delete Godown'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
