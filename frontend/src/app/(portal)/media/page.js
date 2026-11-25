'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { MediaCard } from '@/components/media/MediaCard';
import { useMediaList } from '@/hooks/useMedia';
import { useClasses } from '@/hooks/useClasses';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/lib/constants';

export default function MediaGalleryPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState('');
  const [classId, setClassId] = useState('');
  const [status, setStatus] = useState('');

  const { data: classes } = useClasses();
  const { data, isLoading, isFetching } = useMediaList({
    page,
    limit: 16,
    mediaType: mediaType || undefined,
    classId: classId || undefined,
    status: status || undefined
  });

  const media = data?.data || [];
  const pagination = data?.meta?.pagination;

  return (
    <div>
      <PageHeader
        title="Media Gallery"
        description="Browse all media automatically tagged with the correct students."
        action={
          hasPermission(PERMISSIONS.MEDIA_UPLOAD) && (
            <Link href="/upload">
              <Button>Upload Media</Button>
            </Link>
          )
        }
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            value={mediaType}
            onChange={(e) => {
              setPage(1);
              setMediaType(e.target.value);
            }}
          >
            <option value="">All media types</option>
            <option value="photo">Photos</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="audio">Audio</option>
          </Select>
          <Select
            value={classId}
            onChange={(e) => {
              setPage(1);
              setClassId(e.target.value);
            }}
          >
            <option value="">All classes</option>
            {classes?.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            <option value="uploaded">Uploaded</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <Spinner />
      ) : media.length ? (
        <div className={isFetching ? 'opacity-70' : ''}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((item) => (
              <MediaCard key={item.id} media={item} />
            ))}
          </div>
          <div className="mt-6">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        </div>
      ) : (
        <EmptyState title="No media found" description="Try adjusting your filters or upload new media." />
      )}
    </div>
  );
}
