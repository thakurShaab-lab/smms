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
import { TeacherFormModal } from '@/components/teachers/TeacherFormModal';
import { useTeachers, useDeleteTeacher } from '@/hooks/useTeachers';
import { extractErrorMessage } from '@/lib/axios';

export default function TeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useTeachers({ page, limit: 12, search: search || undefined });
  const deleteTeacher = useDeleteTeacher();

  const teachers = data?.data || [];
  const pagination = data?.meta?.pagination;

  async function handleDeactivate(id) {
    if (!confirm('Deactivate this teacher account?')) return;
    try {
      await deleteTeacher.mutateAsync(id);
      toast.success('Teacher deactivated');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <div>
      <PageHeader title="Teachers" description="Manage teacher accounts and access." action={<Button onClick={() => setIsCreateOpen(true)}>Add Teacher</Button>} />

      <Card className="mb-6">
        <Input
          placeholder="Search by name or employee code"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </Card>

      {isLoading ? (
        <Spinner />
      ) : teachers.length ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Employee Code</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-800/40">
                    <td className="py-3 pr-4 font-medium text-slate-100">{teacher.fullName}</td>
                    <td className="py-3 pr-4 text-slate-400">{teacher.employeeCode}</td>
                    <td className="py-3 pr-4 text-slate-400">{teacher.user?.email}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={teacher.user?.status === 'active' ? 'success' : 'default'}>{teacher.user?.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleDeactivate(teacher.id)}>
                        Deactivate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pagination pagination={pagination} onPageChange={setPage} />
          </div>
        </Card>
      ) : (
        <EmptyState title="No teachers found" />
      )}

      <TeacherFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
