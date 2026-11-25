'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function RootPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isBootstrapping) return;
    router.replace(isAuthenticated ? '/dashboard' : '/login');
  }, [isBootstrapping, isAuthenticated, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <Spinner />
    </div>
  );
}
