'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { linkStudentSchema } from '@/schemas/parentSchemas';
import { useLinkStudentToParent } from '@/hooks/useParents';
import { useStudents } from '@/hooks/useStudents';
import { extractErrorMessage } from '@/lib/axios';

export function LinkStudentModal({ open, onClose, parentId }) {
  const [search, setSearch] = useState('');
  const { data } = useStudents({ search: search || undefined, limit: 10 });
  const linkStudent = useLinkStudentToParent();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ resolver: zodResolver(linkStudentSchema), defaultValues: { relationship: 'guardian' } });

  async function onSubmit(values) {
    try {
      await linkStudent.mutateAsync({ parentId, payload: values });
      toast.success('Student linked to parent');
      reset();
      setSearch('');
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Link Student to Parent" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Search students" placeholder="Type a name or admission number" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select label="Student" error={errors.studentId?.message} {...register('studentId')} defaultValue="">
          <option value="">Select a student</option>
          {data?.data?.map((student) => (
            <option key={student.id} value={student.id}>
              {student.fullName} ({student.admissionNumber})
            </option>
          ))}
        </Select>
        <Select label="Relationship" error={errors.relationship?.message} {...register('relationship')}>
          <option value="father">Father</option>
          <option value="mother">Mother</option>
          <option value="guardian">Guardian</option>
        </Select>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={linkStudent.isPending}>
            Link Student
          </Button>
        </div>
      </form>
    </Modal>
  );
}
