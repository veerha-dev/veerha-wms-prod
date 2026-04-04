import { useState } from 'react';
import { safeParseFloat } from '@/shared/utils/input';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { Package, Search, CheckCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { useToast } from '@/shared/hooks/use-toast';
import { useSalesOrders, useSalesOrder } from '@/features/outbound/hooks/useSalesOrders';

export default function PackingPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Show orders that are ready for packing (picking or packed status)
  const { data: ordersData } = useSalesOrders();

  const filteredOrders = ordersData?.data?.filter((order: any) =>
    (order.orderNumber || order.soNumber || order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer?.name || order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout title="Packing Station" breadcrumbs={[{ label: 'Outbound' }, { label: 'Packing' }]}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Packing Station</h1>
          <p className="text-muted-foreground">Pack picked items for shipment</p>
        </div>
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>

      {!selectedOrderId ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Order to Pack</CardTitle>
            <CardDescription>Choose an order that has been picked</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber || order.soNumber || order.order_number}</TableCell>
                    <TableCell>{order.customer?.name || order.customer_name || '-'}</TableCell>
                    <TableCell>{order._count?.items || order.total_items || 0}</TableCell>
                    <TableCell>
                      <Badge>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => setSelectedOrderId(order.id)}>
                        Start Packing
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredOrders?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders ready for packing. Complete picking first.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <PackingView
          orderId={selectedOrderId}
          onBack={() => setSelectedOrderId(null)}
        />
      )}
      </div>
    </AppLayout>
  );
}

function PackingView({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const { data: order } = useSalesOrder(orderId);
  const { toast } = useToast();
  const [packages, setPackages] = useState<Record<string, any>>({
    'package-1': { items: [], weight: 0 },
  });
  const [itemPackages, setItemPackages] = useState<Record<string, string>>({});

  const handleAssignPackage = (itemId: string, packageId: string) => {
    setItemPackages({ ...itemPackages, [itemId]: packageId });
  };

  const addPackage = () => {
    const newPackageId = `package-${Object.keys(packages).length + 1}`;
    setPackages({ ...packages, [newPackageId]: { items: [], weight: 0 } });
  };

  const handleCompletePacking = async () => {
    const allItemsPacked = (order?.items || order?.sales_order_items)?.every((item: any) =>
      itemPackages[item.id]
    );

    if (!allItemsPacked) {
      toast({
        title: 'Error',
        description: 'All items must be assigned to a package',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Packing completed',
      description: 'Order is ready for shipment',
    });
    onBack();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Packing: {order?.orderNumber || order?.soNumber || order?.order_number}</CardTitle>
              <CardDescription>Customer: {order?.customer?.name || order?.customer_name}</CardDescription>
            </div>
            <Button variant="outline" onClick={onBack}>
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Picked Qty</TableHead>
                  <TableHead>Packed Qty</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(order?.items || order?.sales_order_items)?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.sku?.skuCode || item.skus?.sku_code || '-'}</p>
                        <p className="text-sm text-muted-foreground">{item.sku?.name || item.skus?.name || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.pickedQuantity || item.picked_quantity || 0}</TableCell>
                    <TableCell>{item.packedQuantity || item.packed_quantity || 0}</TableCell>
                    <TableCell>
                      <Select
                        value={itemPackages[item.id] || ''}
                        onValueChange={(v) => handleAssignPackage(item.id, v)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(packages).map(pkgId => (
                            <SelectItem key={pkgId} value={pkgId}>
                              {pkgId.replace('-', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {itemPackages[item.id] ? (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Assigned
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Packages</h3>
              <Button variant="outline" size="sm" onClick={addPackage}>
                <Plus className="h-4 w-4 mr-1" />
                Add Package
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(packages).map(([pkgId, pkg]) => (
                <Card key={pkgId}>
                  <CardHeader>
                    <CardTitle className="text-sm">{pkgId.replace('-', ' ').toUpperCase()}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium">
                        {Object.values(itemPackages).filter(p => p === pkgId).length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`weight-${pkgId}`}>Weight (kg)</Label>
                      <Input
                        id={`weight-${pkgId}`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={pkg.weight}
                        onChange={(e) => {
                          setPackages({
                            ...packages,
                            [pkgId]: { ...pkg, weight: safeParseFloat(e.target.value, 0) },
                          });
                        }}
                        placeholder="0.0"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onBack}>Cancel</Button>
            <Button onClick={handleCompletePacking}>
              Complete Packing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
