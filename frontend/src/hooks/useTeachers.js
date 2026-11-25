'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as teachersApi from '@/services/teachersApi';

export function useTeachers(params) {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: () => teachersApi.listTeachers(params),
    placeholderData: (previousData) => previousData
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teachersApi.createTeacher,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] })
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => teachersApi.updateTeacher(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] })
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teachersApi.deleteTeacher,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] })
  });
}
