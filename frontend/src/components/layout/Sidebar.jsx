'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS, ROLES } from '@/lib/constants';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/media', label: 'Media Gallery', icon: '🖼️', permission: [PERMISSIONS.MEDIA_READ, PERMISSIONS.MEDIA_READ_OWN_CHILD] },
  { href: '/upload', label: 'Upload Media', icon: '⬆️', permission: [PERMISSIONS.MEDIA_UPLOAD] },
  { href: '/students', label: 'Students', icon: '🎓', permission: [PERMISSIONS.STUDENTS_READ] },
  { href: '/classes', label: 'Classes & Sections', icon: '🏫', permission: [PERMISSIONS.CLASSES_MANAGE] },
  { href: '/teachers', label: 'Teachers', icon: '🧑‍🏫', permission: [PERMISSIONS.TEACHERS_MANAGE] },
  { href: '/parents', label: 'Parents', icon: '👪', permission: [PERMISSIONS.PARENTS_MANAGE] },
  { href: '/audit-logs', label: 'Audit Logs', icon: '📜', permission: [PERMISSIONS.AUDIT_READ] }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
        <span className="text-xl">🎒</span>
        <span className="text-sm font-semibold text-slate-100">SMMS</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.filter((item) => !item.permission || hasPermission(...item.permission)).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        Signed in as <span className="font-medium text-slate-300">{user?.role}</span>
        {user?.role === ROLES.PARENT && ' (viewing your children only)'}
      </div>
    </aside>
  );
}
