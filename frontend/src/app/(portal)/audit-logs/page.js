'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { formatDate } from '@/lib/mediaHelpers';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs({ page, limit: 25 });

  const logs = data?.data || [];
  const pagination = data?.meta?.pagination;

  return (
    <div>
      <PageHeader title="Audit Logs" description="A record of every sensitive action taken across the system." />

      {isLoading ? (
        <Spinner />
      ) : logs.length ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Entity</th>
                  <th className="pb-3 pr-4">User ID</th>
                  <th className="pb-3 pr-4">IP Address</th>
                  <th className="pb-3 pr-4">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 pr-4 font-medium text-slate-200">{log.action}</td>
                    <td className="py-3 pr-4 text-slate-400">
                      {log.entityType} #{log.entityId}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{log.userId ?? '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{log.ipAddress || '—'}</td>
                    <td className="py-3 pr-4 text-slate-400">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        </Card>
      ) : (
        <EmptyState title="No audit log entries yet" />
      )}
    </div>
  );
}
