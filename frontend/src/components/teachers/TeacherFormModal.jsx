'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createTeacherSchema } from '@/schemas/teacherSchemas';
import { useCreateTeacher } from '@/hooks/useTeachers';
import { extractErrorMessage } from '@/lib/axios';

export function TeacherFormModal({ open, onClose }) {
  const createTeacher = useCreateTeacher();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ resolver: zodResolver(createTeacherSchema) });

  async function onSubmit(values) {
    try {
      await createTeacher.mutateAsync({ ...values, phone: values.phone || undefined });
      toast.success('Teacher account created successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Teacher">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Full name" placeholder="John Smith" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Email address" type="email" placeholder="john@school.edu" error={errors.email?.message} {...register('email')} />
        <Input label="Employee code" placeholder="TCH-001" error={errors.employeeCode?.message} {...register('employeeCode')} />
        <Input label="Phone (optional)" placeholder="+1 555 000 1111" error={errors.phone?.message} {...register('phone')} />
        <Input label="Temporary password" type="password" error={errors.password?.message} {...register('password')} />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createTeacher.isPending}>
            Create Teacher
          </Button>
        </div>
      </form>
    </Modal>
  );
}
