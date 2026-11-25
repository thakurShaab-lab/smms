'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';

export function useMediaSocketEvents() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const socket = getSocket();
    if (!socket) return undefined;

    function handleProcessed(payload) {
      toast.success(
        `${payload.mediaType} processed${payload.studentIds?.length ? ` — matched ${payload.studentIds.length} student(s)` : ''}`
      );
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media-detail', payload.mediaId] });
    }

    function handleFailed(payload) {
      toast.error(`Failed to process ${payload.mediaType}: ${payload.error}`);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    }

    socket.on('media:processed', handleProcessed);
    socket.on('media:failed', handleFailed);

    return () => {
      socket.off('media:processed', handleProcessed);
      socket.off('media:failed', handleFailed);
    };
  }, [isAuthenticated, queryClient]);
}
