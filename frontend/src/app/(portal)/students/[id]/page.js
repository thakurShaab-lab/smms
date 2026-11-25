'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { FaceEnrollmentPanel } from '@/components/students/FaceEnrollmentPanel';
import { VoiceEnrollmentPanel } from '@/components/students/VoiceEnrollmentPanel';
import { MediaCard } from '@/components/media/MediaCard';
import { useStudent } from '@/hooks/useStudents';
import { useMediaList } from '@/hooks/useMedia';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/lib/constants';

export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { data: student, isLoading } = useStudent(id);
  const { data: mediaResult, isLoading: isMediaLoading } = useMediaList({ studentId: id, limit: 12 });

  if (isLoading) return <Spinner />;
  if (!student) return <EmptyState title="Student not found" />;

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit px-0" onClick={() => router.push('/students')}>
        ← Back to Students
      </Button>

      <Card>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">{student.fullName}</h1>
            <p className="mt-1 text-sm text-slate-400">
              Admission No. {student.admissionNumber} &middot; {student.class?.name} {student.section?.name}
            </p>
          </div>
          <Badge variant={student.status === 'active' ? 'success' : 'default'}>{student.status}</Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-slate-500">Roll Number</p>
            <p className="text-slate-200">{student.rollNumber || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Gender</p>
            <p className="capitalize text-slate-200">{student.gender || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Date of Birth</p>
            <p className="text-slate-200">{student.dateOfBirth || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Parents Linked</p>
            <p className="text-slate-200">{student.studentParents?.length ?? 0}</p>
          </div>
        </div>
      </Card>

      {hasPermission(PERMISSIONS.FACE_ENROLL) && <FaceEnrollmentPanel studentId={id} />}
      {hasPermission(PERMISSIONS.VOICE_ENROLL) && <VoiceEnrollmentPanel studentId={id} />}

      <Card>
        <CardHeader title="Tagged Media" description="Photos, videos and documents this student appears in." />
        {isMediaLoading ? (
          <Spinner />
        ) : mediaResult?.data?.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {mediaResult.data.map((media) => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        ) : (
          <EmptyState title="No media yet" description="Media containing this student will appear here automatically." />
        )}
      </Card>
    </div>
  );
}
