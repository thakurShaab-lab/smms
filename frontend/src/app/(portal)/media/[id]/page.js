'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { TagStudentControl } from '@/components/media/TagStudentControl';
import { useMediaDetail, useUntagStudent, useDeleteMedia } from '@/hooks/useMedia';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/lib/constants';
import { getOriginalFile, getPreviewFile, formatBytes, formatDate, STATUS_VARIANTS } from '@/lib/mediaHelpers';
import { extractErrorMessage } from '@/lib/axios';

export default function MediaDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { data: media, isLoading } = useMediaDetail(id);
  const untagStudent = useUntagStudent(id);
  const deleteMedia = useDeleteMedia();

  if (isLoading) return <Spinner />;
  if (!media) return <EmptyState title="Media not found" />;

  const originalFile = getOriginalFile(media);
  const thumbnailFile = getPreviewFile(media);
  const canManage = hasPermission(PERMISSIONS.MEDIA_UPLOAD);
  const canDelete = hasPermission(PERMISSIONS.MEDIA_DELETE);

  async function handleUntag(studentId) {
    if (!confirm('Remove this student tag?')) return;
    try {
      await untagStudent.mutateAsync(studentId);
      toast.success('Student untagged');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this media permanently?')) return;
    try {
      await deleteMedia.mutateAsync(id);
      toast.success('Media deleted');
      router.push('/media');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit px-0" onClick={() => router.push('/media')}>
        ← Back to Gallery
      </Button>

      <Card>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-100">{media.originalFilename}</h1>
            <p className="mt-1 text-sm text-slate-400">
              Uploaded {formatDate(media.createdAt)} by {media.teacher?.fullName} &middot; {formatBytes(media.sizeBytes)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANTS[media.status]}>{media.status}</Badge>
            {canDelete && (
              <Button variant="danger" onClick={handleDelete} isLoading={deleteMedia.isPending}>
                Delete
              </Button>
            )}
          </div>
        </div>

        {media.status === 'processing' && (
          <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">
            AI recognition is still running — students will be tagged automatically once it completes.
          </div>
        )}
        {media.status === 'failed' && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            Processing failed: {media.processingError || 'Unknown error'}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-xl bg-slate-950">
          {media.mediaType === 'photo' && originalFile && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={originalFile.url} alt={media.originalFilename} className="max-h-[600px] w-full object-contain" />
          )}
          {media.mediaType === 'video' && originalFile && (
            // previewFile is a short, low-res AI-generated clip meant only for quick
            // gallery-card hovers - always play the full original video here.
            <video controls poster={thumbnailFile?.url} className="max-h-[600px] w-full" preload="metadata">
              <source src={originalFile.url} type={originalFile.mimeType} />
            </video>
          )}
          {media.mediaType === 'document' && thumbnailFile && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailFile.url} alt="Document page" className="max-h-[600px] w-full object-contain" />
          )}
          {media.mediaType === 'audio' && originalFile && (
            <div className="flex items-center justify-center p-10">
              <audio controls src={originalFile.url} className="w-full max-w-md" />
            </div>
          )}
        </div>
      </Card>

      {media.mediaType === 'document' && media.ocrResult && (
        <Card>
          <CardHeader title="Extracted Document Data" description="Automatically parsed via OCR." />
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Field label="Student Name" value={media.ocrResult.extractedStudentName} />
            <Field label="Admission Number" value={media.ocrResult.extractedAdmissionNumber} />
            <Field label="Roll Number" value={media.ocrResult.extractedRollNumber} />
            <Field label="Class" value={media.ocrResult.extractedClassName} />
            <Field label="Section" value={media.ocrResult.extractedSectionName} />
            <Field label="Confidence" value={media.ocrResult.confidence ? `${Math.round(media.ocrResult.confidence * 100)}%` : '—'} />
          </div>
          {media.ocrResult.rawText && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-brand-400">View raw OCR text</summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-xs text-slate-400">
                {media.ocrResult.rawText}
              </pre>
            </details>
          )}
        </Card>
      )}

      <Card>
        <CardHeader title="Tagged Students" description="Students automatically detected in this media." />
        {media.mappings?.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {media.mappings.map((mapping) => (
              <Badge key={mapping.studentId} variant={mapping.matchedBy === 'ai' ? 'info' : 'default'} className="flex items-center gap-2">
                <Link href={`/students/${mapping.studentId}`} className="hover:underline">
                  {mapping.student?.fullName}
                </Link>
                {mapping.matchConfidence && <span className="text-slate-500">{Math.round(mapping.matchConfidence * 100)}%</span>}
                {canManage && (
                  <button type="button" className="text-brand-300 hover:text-red-400" onClick={() => handleUntag(mapping.studentId)}>
                    ✕
                  </button>
                )}
              </Badge>
            ))}
          </div>
        ) : (
          <EmptyState title="No students tagged yet" description="Tag a student manually below if AI recognition missed them." />
        )}

        {canManage && <TagStudentControl mediaId={id} excludeStudentIds={media.mappings?.map((m) => m.studentId) || []} />}
      </Card>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="text-slate-200">{value || '—'}</p>
    </div>
  );
}
