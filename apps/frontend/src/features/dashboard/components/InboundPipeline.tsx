import { useWMS } from '@/shared/contexts/WMSContext';
import { Link } from 'react-router-dom';
import { FileText, ClipboardCheck, Search, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const stages = [
  { key: 'po', label: 'Purchase Orders', icon: FileText, path: '/inbound', color: 'bg-blue-500' },
  { key: 'grn', label: 'GRN', icon: ClipboardCheck, path: '/inbound/grn', color: 'bg-amber-500' },
  { key: 'qc', label: 'QC Inspections', icon: Search, path: '/inbound/qc', color: 'bg-green-500' },
];

export function InboundPipeline() {
  const { metrics } = useWMS();

  const counts = {
    po: metrics.poDraft + metrics.poSubmitted + metrics.poApproved,
    grn: metrics.grnPending,
    qc: metrics.qcPending,
  };

  const details = {
    po: [
      { label: 'Draft', value: metrics.poDraft },
      { label: 'Submitted', value: metrics.poSubmitted },
      { label: 'Approved', value: metrics.poApproved },
    ],
    grn: [
      { label: 'Pending', value: metrics.grnPending },
    ],
    qc: [
      { label: 'Pending', value: metrics.qcPending },
    ],
  };

  return (
    <div className="wms-card">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold">Inbound Pipeline</h2>
        <p className="text-sm text-muted-foreground">Purchase Order → GRN → QC</p>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const count = counts[stage.key as keyof typeof counts];
            const stageDetails = details[stage.key as keyof typeof details];

            return (
              <div key={stage.key} className="flex items-center flex-1">
                <Link
                  to={stage.path}
                  className="flex-1 h-[140px] p-3 rounded-lg border border-border hover:border-accent/40 hover:shadow-sm transition-all group flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('h-8 w-8 rounded-md flex items-center justify-center', stage.color + '/10')}>
                      <Icon className={cn('h-4 w-4', stage.color.replace('bg-', 'text-'))} />
                    </div>
                    <span className="text-2xl font-bold text-foreground">{count}</span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">{stage.label}</p>
                  <div className="space-y-0.5 flex-1 flex flex-col justify-end">
                    {stageDetails.map((d) => (
                      <div key={d.label} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{d.label}</span>
                        <span className="font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </Link>
                {idx < stages.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
