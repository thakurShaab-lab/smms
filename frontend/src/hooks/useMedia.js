'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as mediaApi from '@/services/mediaApi';

export function useMediaList(params) {
  return useQuery({
    queryKey: ['media', params],
    queryFn: () => mediaApi.listMedia(params),
    placeholderData: (previousData) => previousData
  });
}

export function useMediaDetail(id) {
  return useQuery({
    queryKey: ['media-detail', id],
    queryFn: () => mediaApi.getMedia(id),
    enabled: Boolean(id)
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaType, file, meta, onUploadProgress }) => mediaApi.uploadMedia(mediaType, file, meta, onUploadProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] })
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mediaApi.deleteMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media'] })
  });
}

export function useTagStudent(mediaId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId) => mediaApi.tagStudentInMedia(mediaId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-detail', mediaId] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}

export function useUntagStudent(mediaId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId) => mediaApi.untagStudentFromMedia(mediaId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-detail', mediaId] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }
  });
}
