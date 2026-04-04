import { useAuditLogs } from '@/hooks/useTenants';
import { ScrollText, Loader2 } from 'lucide-react';

export default function AuditLogPage() {
  const { data: logs, isLoading } = useAuditLogs();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ScrollText className="h-6 w-6" />Audit Log</h1>
        <p className="text-sm text-slate-500">Complete log of all super admin actions. Cannot be deleted or edited.</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : (logs || []).length === 0 ? (
          <div className="text-center py-12">
            <ScrollText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No audit log entries yet</p>
            <p className="text-xs text-slate-400 mt-1">Actions will be recorded as you manage the platform</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="text-left p-3 font-medium">Timestamp</th>
              <th className="text-left p-3 font-medium">Admin</th>
              <th className="text-left p-3 font-medium">Action</th>
              <th className="text-left p-3 font-medium">Entity</th>
              <th className="text-left p-3 font-medium">Details</th>
            </tr></thead>
            <tbody>
              {(logs || []).map((log: any) => (
                <tr key={log.id} className="border-t">
                  <td className="p-3 text-slate-500 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3">{log.adminName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-700">{log.action}</span>
                  </td>
                  <td className="p-3 text-slate-500">{log.entityType || '-'}</td>
                  <td className="p-3 text-xs text-slate-400 max-w-[200px] truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
