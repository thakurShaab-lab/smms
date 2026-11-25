'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { StudentFormModal } from '@/components/students/StudentFormModal';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/lib/constants';

export default function StudentsPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: classes } = useClasses();
  const { data, isLoading, isFetching } = useStudents({ page, limit: 12, search: search || undefined, classId: classId || undefined });

  const students = data?.data || [];
  const pagination = data?.meta?.pagination;

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student records and enrolled face profiles."
        action={
          hasPermission(PERMISSIONS.STUDENTS_CREATE) && <Button onClick={() => setIsCreateOpen(true)}>Add Student</Button>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search by name or admission number"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="sm:flex-1"
          />
          <Select
            value={classId}
            onChange={(e) => {
              setPage(1);
              setClassId(e.target.value);
            }}
            className="sm:w-56"
          >
            <option value="">All classes</option>
            {classes?.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <Spinner />
      ) : students.length ? (
        <Card className={isFetching ? 'opacity-70' : ''}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Admission No.</th>
                  <th className="pb-3 pr-4">Class</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Faces enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/40">
                    <td className="py-3 pr-4">
                      <Link href={`/students/${student.id}`} className="font-medium text-slate-100 hover:text-brand-400">
                        {student.fullName}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{student.admissionNumber}</td>
                    <td className="py-3 pr-4 text-slate-400">
                      {student.class?.name} {student.section?.name}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={student.status === 'active' ? 'success' : 'default'}>{student.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{student.faceEmbeddings?.length ?? 0}</td>
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
        <EmptyState title="No students found" description="Try adjusting your search or add a new student." />
      )}

      <StudentFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
