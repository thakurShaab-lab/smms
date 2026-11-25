'use client';

import { useQuery } from '@tanstack/react-query';
import * as auditApi from '@/services/auditApi';

export function useAuditLogs(params) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditApi.listAuditLogs(params),
    placeholderData: (previousData) => previousData
  });
}
