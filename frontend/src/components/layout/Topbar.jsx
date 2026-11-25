'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const displayName = user?.profile?.fullName || user?.email;

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur lg:px-6">
      <div className="lg:hidden text-sm font-semibold text-slate-100">SMMS</div>
      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-100">{displayName}</p>
          <p className="text-xs capitalize text-slate-500">{user?.role}</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
