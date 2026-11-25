'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/Spinner';

export default function PortalLayout({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isBootstrapping, isAuthenticated, router]);

  if (isBootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AppShell>{children}</AppShell>;
}
