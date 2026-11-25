'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as parentsApi from '@/services/parentsApi';

export function useParents(params) {
  return useQuery({
    queryKey: ['parents', params],
    queryFn: () => parentsApi.listParents(params),
    placeholderData: (previousData) => previousData
  });
}

export function useCreateParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: parentsApi.createParent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parents'] })
  });
}

export function useLinkStudentToParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ parentId, payload }) => parentsApi.linkStudentToParent(parentId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parents'] })
  });
}

export function useUnlinkStudentFromParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ parentId, studentId }) => parentsApi.unlinkStudentFromParent(parentId, studentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parents'] })
  });
}
