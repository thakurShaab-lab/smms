'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { MediaCard } from '@/components/media/MediaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useParents } from '@/hooks/useParents';
import { useMediaList } from '@/hooks/useMedia';
import { PERMISSIONS } from '@/lib/constants';

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();

  const canReadStudents = hasPermission(PERMISSIONS.STUDENTS_READ);
  const canManageTeachers = hasPermission(PERMISSIONS.TEACHERS_MANAGE);
  const canManageParents = hasPermission(PERMISSIONS.PARENTS_MANAGE);
  const canUpload = hasPermission(PERMISSIONS.MEDIA_UPLOAD);

  const studentsQuery = useStudents({ page: 1, limit: 1 });
  const teachersQuery = useTeachers({ page: 1, limit: 1 });
  const parentsQuery = useParents({ page: 1, limit: 1 });
  const recentMediaQuery = useMediaList({ page: 1, limit: 8 });

  return (
    <div>
      <PageHeader
        title={`Welcome back${user?.profile?.fullName ? `, ${user.profile.fullName}` : ''}`}
        description="Here's what's happening across your school's media library."
        action={
          canUpload && (
            <Link href="/upload">
              <Button>Upload Media</Button>
            </Link>
          )
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {canReadStudents && (
          <StatCard
            label="Students"
            icon="🎓"
            isLoading={studentsQuery.isLoading}
            value={studentsQuery.data?.meta?.pagination?.totalItems ?? 0}
          />
        )}
        {canManageTeachers && (
          <StatCard
            label="Teachers"
            icon="🧑‍🏫"
            isLoading={teachersQuery.isLoading}
            value={teachersQuery.data?.meta?.pagination?.totalItems ?? 0}
          />
        )}
        {canManageParents && (
          <StatCard
            label="Parents"
            icon="👪"
            isLoading={parentsQuery.isLoading}
            value={parentsQuery.data?.meta?.pagination?.totalItems ?? 0}
          />
        )}
        <StatCard
          label="Media Files"
          icon="🖼️"
          isLoading={recentMediaQuery.isLoading}
          value={recentMediaQuery.data?.meta?.pagination?.totalItems ?? 0}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Recent Media</h2>
        <Link href="/media" className="text-sm text-brand-400 hover:text-brand-300">
          View all →
        </Link>
      </div>

      {recentMediaQuery.isLoading ? (
        <Spinner />
      ) : recentMediaQuery.data?.data?.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recentMediaQuery.data.data.map((media) => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No media yet"
          description="Uploaded photos, videos, documents and audio will show up here as soon as they're processed."
        />
      )}
    </div>
  );
}
