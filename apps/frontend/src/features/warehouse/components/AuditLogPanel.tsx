import { 
  History,
  User,
  Layers,
  Grid3X3,
  Box,
  Lock,
  Unlock,
  Plus,
  Edit,
  Move,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { MappingAuditLog } from '@/shared/types/mapping';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface AuditLogPanelProps {
  logs: MappingAuditLog[];
}

const actionConfig = {
  create: { icon: Plus, color: 'text-success', bg: 'bg-success/10' },
  update: { icon: Edit, color: 'text-info', bg: 'bg-info/10' },
  delete: { icon: Trash2, color: 'text-destructive', bg: 'bg-destructive/10' },
  lock: { icon: Lock, color: 'text-warning', bg: 'bg-warning/10' },
  unlock: { icon: Unlock, color: 'text-success', bg: 'bg-success/10' },
  move: { icon: Move, color: 'text-primary', bg: 'bg-primary/10' },
};

const entityIcons = {
  zone: Layers,
  rack: Grid3X3,
  bin: Box,
};

export function AuditLogPanel({ logs }: AuditLogPanelProps) {
  return (
    <div className="border rounded-lg bg-card">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Recent Activity</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {logs.length} entries
        </Badge>
      </div>
      
      <ScrollArea className="h-[300px]">
        <div className="divide-y divide-border">
          {logs.map((log) => {
            const action = actionConfig[log.action];
            const EntityIcon = entityIcons[log.entityType];
            const ActionIcon = action.icon;
            
            return (
              <div key={log.id} className="p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', action.bg)}>
                    <ActionIcon className={cn('h-4 w-4', action.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">{log.action}</span>
                      <EntityIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-mono">{log.entityCode}</span>
                    </div>
                    
                    {log.reason && (
                      <p className="text-xs text-muted-foreground mb-1">
                        "{log.reason}"
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{log.userName}</span>
                      <span>•</span>
                      <span title={format(log.timestamp, 'PPpp')}>
                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
