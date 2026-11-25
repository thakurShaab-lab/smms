'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useMediaSocketEvents } from '@/hooks/useMediaSocketEvents';

export function AppShell({ children }) {
  useMediaSocketEvents();

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
