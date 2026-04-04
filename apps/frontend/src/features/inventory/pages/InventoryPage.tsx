import { AppLayout } from '@/shared/components/layout/AppLayout';
import {
  Package,
  FileText,
  Layers,
  Calendar,
  ArrowLeftRight,
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { InventoryOverview } from '@/features/inventory/components/InventoryOverview';
import { SKUMaster } from '@/features/inventory/components/SKUMaster';
import { StockLevels } from '@/features/inventory/components/StockLevels';
import { BatchExpiry } from '@/features/inventory/components/BatchExpiry';
import { DamagedGoods } from '@/features/inventory/components/DamagedGoods';
import { StockAdjustments } from '@/features/inventory/components/StockAdjustments';
import { CycleCountPage } from '@/features/inventory/components/CycleCountPage';
import { StockTransferPage } from '@/features/inventory/components/StockTransferPage';
import { useRealtimeInventory } from '@/features/inventory/hooks/useRealtimeInventory';

export default function InventoryPage() {
  // Enable realtime subscriptions for inventory data
  useRealtimeInventory();
  return (
    <AppLayout
      title="Inventory Management"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Inventory' }]}
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="sku-master" className="gap-2 data-[state=active]:bg-background">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">SKU Master</span>
          </TabsTrigger>
          <TabsTrigger value="stock-levels" className="gap-2 data-[state=active]:bg-background">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Stock Levels</span>
          </TabsTrigger>
          <TabsTrigger value="batch-expiry" className="gap-2 data-[state=active]:bg-background">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Batch & Expiry</span>
          </TabsTrigger>
          <TabsTrigger value="transfers" className="gap-2 data-[state=active]:bg-background">
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Transfers</span>
          </TabsTrigger>
          <TabsTrigger value="damaged" className="gap-2 data-[state=active]:bg-background">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Damaged</span>
          </TabsTrigger>
          <TabsTrigger value="adjustments" className="gap-2 data-[state=active]:bg-background">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Adjustments</span>
          </TabsTrigger>
          <TabsTrigger value="cycle-count" className="gap-2 data-[state=active]:bg-background">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Cycle Count</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <InventoryOverview />
        </TabsContent>

        <TabsContent value="sku-master">
          <SKUMaster />
        </TabsContent>

        <TabsContent value="stock-levels">
          <StockLevels />
        </TabsContent>

        <TabsContent value="batch-expiry">
          <BatchExpiry />
        </TabsContent>

        <TabsContent value="transfers">
          <StockTransferPage />
        </TabsContent>

        <TabsContent value="damaged">
          <DamagedGoods />
        </TabsContent>

        <TabsContent value="adjustments">
          <StockAdjustments />
        </TabsContent>

        <TabsContent value="cycle-count">
          <CycleCountPage />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
