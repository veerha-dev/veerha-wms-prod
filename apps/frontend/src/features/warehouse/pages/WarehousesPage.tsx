import { AppLayout } from '@/shared/components/layout/AppLayout';
import { useWMS } from '@/shared/contexts/WMSContext';
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Clock,
  Package,
  TrendingUp,
  Settings,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Users,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  WarehouseDetailDialog,
  EditWarehouseDialog,
  CreateWarehouseDialog,
  DeleteWarehouseDialog,
} from '@/features/warehouse/components';

import { useUpdateWarehouse, useDeleteWarehouse } from '@/features/warehouse/hooks/useWarehouses';

type DBWarehouse = any;

const warehouseTypes = [
  { value: 'logistics', label: 'Logistics Godown', color: 'bg-info/10 text-info border-info/20' },
  { value: 'manufacturing', label: 'Manufacturing Unit', color: 'bg-warning/10 text-warning border-warning/20' },
  { value: 'franchise', label: 'Franchise Outlet', color: 'bg-accent/10 text-accent border-accent/20' },
  { value: 'hub', label: 'Distribution Centre', color: 'bg-success/10 text-success border-success/20' },
  { value: 'cold_storage', label: 'Cold Storage', color: 'bg-primary/10 text-primary border-primary/20' },
  { value: 'bonded', label: 'Bonded Warehouse', color: 'bg-muted text-muted-foreground border-muted' },
];

const statusConfig = {
  active: { label: 'Active', icon: CheckCircle2, color: 'text-success bg-success/10' },
  inactive: { label: 'Inactive', icon: AlertCircle, color: 'text-muted-foreground bg-muted' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-warning bg-warning/10' },
};

export default function WarehousesPage() {
  const { warehouses, tenant, isLoading } = useWMS();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<DBWarehouse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const filteredWarehouses = warehouses.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.city?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesType = typeFilter === 'all' || w.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getCap = (w: any) => w.totalCapacity ?? w.total_capacity ?? 0;
  const getUsed = (w: any) => w.currentOccupancy ?? w.used_capacity ?? 0;
  const totalCapacity = warehouses.reduce((acc: number, w: any) => acc + getCap(w), 0);
  const avgUtilization = warehouses.length > 0 
    ? Math.round(warehouses.reduce((acc: number, w: any) => {
        const util = getCap(w) > 0 ? (getUsed(w) / getCap(w)) * 100 : 0;
        return acc + util;
      }, 0) / warehouses.length)
    : 0;

  // Calculate utilization for a warehouse
  const getUtilization = (w: DBWarehouse) => {
    const cap = getCap(w);
    if (!cap || cap === 0) return 0;
    return Math.round((getUsed(w) / cap) * 100);
  };

  // Action handlers
  const openViewDetails = (warehouse: DBWarehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDetailOpen(true);
  };

  const openEdit = (warehouse: DBWarehouse) => {
    setSelectedWarehouse(warehouse);
    setIsEditOpen(true);
  };

  const openConfigureZones = (warehouse: DBWarehouse) => {
    setSelectedWarehouse(warehouse);
    // Configure Zones functionality removed
  };

  const openDelete = (warehouse: DBWarehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDeleteOpen(true);
  };

  const handleUpdateWarehouse = async (updates: Partial<DBWarehouse>) => {
    if (!selectedWarehouse) return;
    
    try {
      await updateWarehouse.mutateAsync({
        id: selectedWarehouse.id,
        ...updates,
      });
      setIsEditOpen(false);
    } catch (error) {
      console.error('Failed to update warehouse:', error);
    }
  };

  const handleDeleteWarehouse = async () => {
    if (!selectedWarehouse) return;
    try {
      await deleteWarehouse.mutateAsync(selectedWarehouse.id);
      setIsDeleteOpen(false);
      setSelectedWarehouse(null);
    } catch (error) {
      console.error('Failed to delete warehouse:', error);
    }
  };

  const handleConfigureRacks = () => {
    // Navigate to mapping page
    window.location.href = `/mapping?warehouse=${selectedWarehouse?.id}`;
  };

  const handleConfigureInventory = () => {
    // Navigate to inventory page
    window.location.href = `/inventory?warehouse=${selectedWarehouse?.id}`;
  };

  if (isLoading) {
    return (
      <AppLayout
        title="Godowns"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Godowns' }]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Godowns"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Godowns' }]}
    >
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{warehouses.length}</p>
              <p className="text-sm text-muted-foreground">Total Godowns</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCapacity.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">Total Capacity (sqft)</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgUtilization}%</p>
              <p className="text-sm text-muted-foreground">Avg Utilization</p>
            </div>
          </div>
        </div>
        <div className="wms-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">Unlimited</p>
              <p className="text-sm text-muted-foreground">Max Allowed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="wms-card mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search godowns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {warehouseTypes.map((type, index) => (
                  <SelectItem key={`type-${type.value}-${index}`} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Godown
          </Button>
        </div>
      </div>

      {/* Warehouse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredWarehouses.map((warehouse, index) => {
          const typeConfig = warehouseTypes.find((t) => t.value === warehouse.type);
          const status = statusConfig[warehouse.status as keyof typeof statusConfig] || statusConfig.active;
          const StatusIcon = status.icon;
          const utilization = getUtilization(warehouse);

          return (
            <div 
              key={`warehouse-${warehouse.id}-${index}`} 
              className="wms-card-interactive group cursor-pointer"
              onClick={() => openViewDetails(warehouse)}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{warehouse.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {warehouse.city || 'No city'}, {warehouse.country || 'India'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        openViewDetails(warehouse);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        openEdit(warehouse);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDelete(warehouse);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className={cn('capitalize', typeConfig?.color)}>
                    {warehouse.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={cn('gap-1', status.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>

                {/* Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" />
                      Capacity
                    </span>
                    <span className="font-medium">{(getCap(warehouse)).toLocaleString('en-IN')} units</span>
                  </div>
                </div>

                {/* Utilization */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Utilization</span>
                    <span className={cn(
                      'text-sm font-semibold',
                      utilization >= 90 ? 'text-destructive' :
                      utilization >= 70 ? 'text-warning' : 'text-success'
                    )}>
                      {utilization}%
                    </span>
                  </div>
                  <Progress value={utilization} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {(getUsed(warehouse)).toLocaleString('en-IN')} / {(getCap(warehouse)).toLocaleString('en-IN')} units used
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredWarehouses.length === 0 && (
        <div className="wms-card p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No godowns found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search or filters.' : 'Get started by adding your first godown.'}
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Godown
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <CreateWarehouseDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        maxWarehouses={999999}
        currentCount={warehouses.length}
      />

      <WarehouseDetailDialog
        warehouse={selectedWarehouse}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <EditWarehouseDialog
        warehouse={selectedWarehouse}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={handleUpdateWarehouse}
      />

      <DeleteWarehouseDialog
        warehouse={selectedWarehouse}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDelete={handleDeleteWarehouse}
      />

      </AppLayout>
  );
}
