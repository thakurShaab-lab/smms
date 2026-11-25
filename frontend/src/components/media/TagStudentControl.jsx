'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useStudents } from '@/hooks/useStudents';
import { useTagStudent } from '@/hooks/useMedia';
import { extractErrorMessage } from '@/lib/axios';

export function TagStudentControl({ mediaId, excludeStudentIds }) {
  const [search, setSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const { data } = useStudents({ search: search || undefined, limit: 10 });
  const tagStudent = useTagStudent(mediaId);

  const candidates = (data?.data || []).filter((student) => !excludeStudentIds.includes(student.id));

  async function handleTag() {
    if (!selectedStudentId) return;
    try {
      await tagStudent.mutateAsync(Number(selectedStudentId));
      toast.success('Student tagged successfully');
      setSelectedStudentId('');
      setSearch('');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input placeholder="Search students to tag" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:flex-1" />
      <Select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="sm:w-56">
        <option value="">Select student</option>
        {candidates.map((student) => (
          <option key={student.id} value={student.id}>
            {student.fullName} ({student.admissionNumber})
          </option>
        ))}
      </Select>
      <Button onClick={handleTag} isLoading={tagStudent.isPending} disabled={!selectedStudentId}>
        Tag Student
      </Button>
    </div>
  );
}
