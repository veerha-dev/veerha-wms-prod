import { useState } from 'react';
import { Hash, Search, Clock, ArrowRight, MapPin, Package, Truck, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useSerials, useSerialTimeline } from '@/features/inventory/hooks/useSerials';

interface SerialRegistryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skuId?: string;
  skuCode?: string;
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  in_stock: { color: 'bg-green-100 text-green-700', icon: Package },
  picked: { color: 'bg-blue-100 text-blue-700', icon: ArrowRight },
  packed: { color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped: { color: 'bg-orange-100 text-orange-700', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  returned: { color: 'bg-yellow-100 text-yellow-700', icon: RotateCcw },
  damaged: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

export function SerialRegistry({ open, onOpenChange, skuId, skuCode }: SerialRegistryProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timelineSerialId, setTimelineSerialId] = useState<string | null>(null);

  const { data: serialsData, isLoading } = useSerials({
    skuId, search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 100,
  });
  const serials = serialsData?.data || [];
  const { data: timeline } = useSerialTimeline(timelineSerialId);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Serial Number Registry {skuCode && <Badge variant="outline">{skuCode}</Badge>}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search serial number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="picked">Picked</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="max-h-[500px]">
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>GRN #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serials.map((s: any) => {
                    const sc = statusConfig[s.status] || statusConfig.in_stock;
                    const Icon = sc.icon;
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono font-medium text-sm">{s.serialNumber}</TableCell>
                        <TableCell className="text-xs">{s.skuCode || '-'}</TableCell>
                        <TableCell>
                          <Badge className={`${sc.color} gap-1`}><Icon className="h-3 w-3" />{s.status.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">{s.binCode || s.warehouseName || '-'}</TableCell>
                        <TableCell className="text-xs">{formatDate(s.receivedAt)}</TableCell>
                        <TableCell className="text-xs">{s.grnNumber || '-'}</TableCell>
                        <TableCell className="text-xs">{s.customerName || '-'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setTimelineSerialId(s.id)}>
                            <Clock className="h-3 w-3 mr-1" />Timeline
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {serials.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Hash className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">No serial numbers found</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog open={!!timelineSerialId} onOpenChange={(o) => !o && setTimelineSerialId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />Serial Timeline
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />
              {(timeline || []).map((entry: any, idx: number) => {
                const typeIcons: Record<string, any> = {
                  received: Package, putaway: MapPin, picked: ArrowRight,
                  shipped: Truck, delivered: CheckCircle, returned: RotateCcw, damaged: AlertTriangle,
                };
                const MoveIcon = typeIcons[entry.movementType] || Clock;
                return (
                  <div key={idx} className="relative">
                    <div className="absolute -left-4 top-1 h-4 w-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                      <MoveIcon className="h-2 w-2" />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs capitalize">{entry.movementType}</Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(entry.createdAt)}</span>
                      </div>
                      {entry.toLocation && <p className="text-xs text-muted-foreground">→ {entry.toLocation}</p>}
                      {entry.notes && <p className="text-xs mt-1">{entry.notes}</p>}
                      {entry.performedByName && <p className="text-[10px] text-muted-foreground mt-1">By: {entry.performedByName}</p>}
                    </div>
                  </div>
                );
              })}
              {(!timeline || timeline.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No timeline entries</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
