import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Layers,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Settings,
  BarChart3,
  Activity,
  Edit3,
  Trash2,
  MoreHorizontal,
  Package,
  Grid3X3,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useZoneContext } from '@/shared/contexts/ZoneContext';
import { ZoneHeatmap } from '../dashboard/ZoneHeatmap';
import { cn } from '@/shared/lib/utils';
import React from 'react';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'optimal':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'empty':
      return <Layers className="h-4 w-4 text-gray-400" />;
    default:
      return <Layers className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'optimal':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'empty':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getUtilizationColor = (utilization: number) => {
  if (utilization >= 90) return 'text-red-600';
  if (utilization >= 70) return 'text-yellow-600';
  if (utilization >= 50) return 'text-blue-600';
  return 'text-green-600';
};

export function ZoneManagement() {
  const { 
    zones, 
    isLoading, 
    getHighUtilizationZones, 
    getEmptyZones, 
    calculateTotalUtilization,
    getZonesByType 
  } = useZoneContext();

  const [activeTab, setActiveTab] = useState('zones');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);

  const handleDeleteClick = (zone) => {
    setZoneToDelete(zone);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (zoneToDelete) {
      // In a real implementation, this would call the delete API
      toast.success(`Zone "${zoneToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
    }
  };

  const handleEditZone = (zone) => {
    // In a real implementation, this would open the edit dialog
    toast.info(`Edit zone "${zone.name}" - functionality coming soon`);
  };

  const handleViewRacks = (zone) => {
    // Navigate to mapping page filtered by zone
    window.location.href = `/mapping?zone=${zone.id}`;
  };

  const handleViewInventory = (zone) => {
    // Navigate to inventory page filtered by zone
    window.location.href = `/inventory?zone=${zone.id}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const highUtilizationZones = getHighUtilizationZones(80);
  const emptyZones = getEmptyZones();
  const totalUtilization = calculateTotalUtilization();
  const zoneTypes = ['bulk', 'rack', 'cold', 'hazmat', 'staging', 'dispatch', 'returns', 'quarantine'];

  // Calculate total capacity for the header
  const totalZoneCapacity = zones.reduce((sum, zone) => sum + zone.total_capacity, 0);
  const warehouseCapacity = 15500; // From the screenshot

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Manage zones for Mumbai Central Warehouse</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>{zones.length} Zones</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{totalZoneCapacity.toLocaleString()} Total Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span>{warehouseCapacity.toLocaleString()} Warehouse Capacity</span>
            </div>
          </div>
        </div>
        <Button className="bg-wms-picking text-white hover:bg-wms-picking/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Zone
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="zones">Zones</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="zones" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => {
              const ZoneIcon = zone.type === 'rack' ? Layers : Package;
              
              return (
                <Card key={zone.id} className="relative group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${zone.color}20` }}
                        >
                          <ZoneIcon className="h-5 w-5" style={{ color: zone.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold truncate">
                            {zone.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs" style={{ borderColor: zone.color, color: zone.color }}>
                              {zone.code}
                            </Badge>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {zone.type.replace('-', ' ')} Storage
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewRacks(zone)}>
                            <Grid3X3 className="h-4 w-4 mr-2" />
                            View Racks
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewInventory(zone)}>
                            <Package className="h-4 w-4 mr-2" />
                            View Inventory
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditZone(zone)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Zone
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(zone)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Zone
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Capacity Info */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{zone.total_capacity.toLocaleString()}</span>
                      </div>
                      
                      {/* Utilization */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Utilization</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{zone.utilization}%</span>
                            <Badge variant="outline" className={cn('text-xs', getStatusColor(zone.utilization))}>
                              {zone.utilization === 0 ? 'empty' : zone.utilization >= 90 ? 'critical' : zone.utilization >= 70 ? 'warning' : 'optimal'}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={zone.utilization} className="h-2" />
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Grid3X3 className="h-3 w-3 text-muted-foreground" />
                          <span>{zone.rackCount || 0} Racks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span>{zone.binCount || 0} Bins</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <ZoneHeatmap />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zone Analytics</CardTitle>
              <CardDescription>
                Advanced analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Advanced analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Zone</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{zoneToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {zoneToDelete && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-8 w-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${zoneToDelete.color}20` }}
                  >
                    <ZoneIcon className="h-4 w-4" style={{ color: zoneToDelete.color }} />
                  </div>
                  <div>
                    <p className="font-medium">{zoneToDelete.name}</p>
                    <p className="text-sm text-muted-foreground">{zoneToDelete.code}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• This will remove the zone and all associated racks and bins</p>
                <p>• Any inventory in this zone will need to be relocated</p>
                <p>• This action cannot be undone</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
