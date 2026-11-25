'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as studentsApi from '@/services/studentsApi';

export function useStudents(params) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentsApi.listStudents(params),
    placeholderData: (previousData) => previousData
  });
}

export function useStudent(id) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.getStudent(id),
    enabled: Boolean(id)
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentsApi.createStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => studentsApi.updateStudent(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
    }
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentsApi.deleteStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] })
  });
}

export function useFaceImages(studentId) {
  return useQuery({
    queryKey: ['student-faces', studentId],
    queryFn: () => studentsApi.listFaceImages(studentId),
    enabled: Boolean(studentId)
  });
}

export function useAddFaceImage(studentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => studentsApi.addFaceImage(studentId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-faces', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
    }
  });
}

export function useRemoveFaceImage(studentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (faceId) => studentsApi.removeFaceImage(studentId, faceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-faces', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
    }
  });
}

export function useVoiceSamples(studentId) {
  return useQuery({
    queryKey: ['student-voices', studentId],
    queryFn: () => studentsApi.listVoiceSamples(studentId),
    enabled: Boolean(studentId)
  });
}

export function useAddVoiceSample(studentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => studentsApi.addVoiceSample(studentId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-voices', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
    }
  });
}

export function useRemoveVoiceSample(studentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (voiceId) => studentsApi.removeVoiceSample(studentId, voiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-voices', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
    }
  });
}
