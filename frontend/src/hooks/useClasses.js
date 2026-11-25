'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as classesApi from '@/services/classesApi';

export function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: classesApi.listClasses });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classesApi.createClass,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => classesApi.updateClass(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classesApi.deleteClass,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classesApi.createSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => classesApi.updateSection(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classesApi.deleteSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] })
  });
}
