'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ParentFormModal } from '@/components/parents/ParentFormModal';
import { LinkStudentModal } from '@/components/parents/LinkStudentModal';
import { useParents, useUnlinkStudentFromParent } from '@/hooks/useParents';
import { extractErrorMessage } from '@/lib/axios';

export default function ParentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [linkParentId, setLinkParentId] = useState(null);

  const { data, isLoading } = useParents({ page, limit: 10, search: search || undefined });
  const unlinkStudent = useUnlinkStudentFromParent();

  const parents = data?.data || [];
  const pagination = data?.meta?.pagination;

  async function handleUnlink(parentId, studentId) {
    if (!confirm('Unlink this student from the parent?')) return;
    try {
      await unlinkStudent.mutateAsync({ parentId, studentId });
      toast.success('Student unlinked');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <div>
      <PageHeader title="Parents" description="Manage parent accounts and their linked children." action={<Button onClick={() => setIsCreateOpen(true)}>Add Parent</Button>} />

      <Card className="mb-6">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </Card>

      {isLoading ? (
        <Spinner />
      ) : parents.length ? (
        <div className="flex flex-col gap-4">
          {parents.map((parent) => (
            <Card key={parent.id}>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">{parent.fullName}</h3>
                  <p className="text-sm text-slate-400">{parent.email || parent.phone || 'No contact info'}</p>
                </div>
                <Button variant="secondary" onClick={() => setLinkParentId(parent.id)}>
                  + Link Student
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {parent.studentParents?.length ? (
                  parent.studentParents.map((link) => (
                    <Badge key={link.studentId} variant="info" className="flex items-center gap-1">
                      {link.student?.fullName} ({link.relationship})
                      <button
                        type="button"
                        className="ml-1 text-brand-300 hover:text-red-400"
                        onClick={() => handleUnlink(parent.id, link.studentId)}
                      >
                        ✕
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No students linked yet</span>
                )}
              </div>
            </Card>
          ))}
          <Card>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </Card>
        </div>
      ) : (
        <EmptyState title="No parents found" />
      )}

      <ParentFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <LinkStudentModal open={Boolean(linkParentId)} parentId={linkParentId} onClose={() => setLinkParentId(null)} />
    </div>
  );
}
