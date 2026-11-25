'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export default function LoginPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isBootstrapping, isAuthenticated, router]);

  if (isBootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-2 text-3xl">🎒</div>
          <h1 className="text-xl font-semibold text-slate-100">Student Media Management System</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
