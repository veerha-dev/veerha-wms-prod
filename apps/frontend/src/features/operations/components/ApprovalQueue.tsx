import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAdjustments, useApproveAdjustment, useRejectAdjustment } from '@/features/operations/hooks/useAdjustments';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export function ApprovalQueue() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const adjustmentsQuery = useAdjustments({ status: selectedTab });
  const approveMutation = useApproveAdjustment();
  const rejectMutation = useRejectAdjustment();
  
  const adjustments = adjustmentsQuery.data?.data || [];
  const isLoading = adjustmentsQuery.isLoading;

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  const filteredAdjustments = adjustments?.filter(adj => adj.status === selectedTab) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Approval Queue</h2>
        <Badge variant="secondary">
          {filteredAdjustments.length} items
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {filteredAdjustments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending approvals</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAdjustments.map((adjustment) => (
                  <Card key={adjustment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <CardTitle className="text-lg">
                            Stock Adjustment #{adjustment.adjustmentNumber}
                          </CardTitle>
                          <Badge variant="outline">
                            {adjustment.adjustmentType}
                          </Badge>
                        </div>
                        <Badge className={statusConfig.pending.color}>
                          {statusConfig.pending.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">SKU:</span>
                            <p>{adjustment.skuCode}</p>
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span>
                            <p>{adjustment.quantity}</p>
                          </div>
                          <div>
                            <span className="font-medium">Reason:</span>
                            <p>{adjustment.reason}</p>
                          </div>
                          <div>
                            <span className="font-medium">Requested by:</span>
                            <p>{adjustment.requestedBy}</p>
                          </div>
                        </div>
                        
                        {adjustment.description && (
                          <div>
                            <span className="font-medium text-sm">Description:</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {adjustment.description}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Created: {format(new Date(adjustment.createdAt), 'MMM d, h:mm a')}</span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(adjustment.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(adjustment.id)}
                            disabled={rejectMutation.isPending}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {filteredAdjustments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No approved adjustments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAdjustments.map((adjustment) => (
                  <Card key={adjustment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Stock Adjustment #{adjustment.adjustmentNumber}
                        </CardTitle>
                        <Badge className={statusConfig.approved.color}>
                          {statusConfig.approved.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Approved by {adjustment.approvedBy} on {format(new Date(adjustment.approvedAt!), 'MMM d, h:mm a')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {filteredAdjustments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No rejected adjustments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAdjustments.map((adjustment) => (
                  <Card key={adjustment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Stock Adjustment #{adjustment.adjustmentNumber}
                        </CardTitle>
                        <Badge className={statusConfig.rejected.color}>
                          {statusConfig.rejected.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Rejected by {adjustment.rejectedBy} on {format(new Date(adjustment.rejectedAt!), 'MMM d, h:mm a')}
                        {adjustment.rejectionReason && (
                          <span className="block mt-1">Reason: {adjustment.rejectionReason}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
