'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { studentSchema } from '@/schemas/studentSchemas';
import { useCreateStudent } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { extractErrorMessage } from '@/lib/axios';

export function StudentFormModal({ open, onClose }) {
  const createStudent = useCreateStudent();
  const { data: classes } = useClasses();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({ resolver: zodResolver(studentSchema) });

  const selectedClassId = watch('classId');
  const sections = useMemo(() => {
    const selectedClass = classes?.find((c) => String(c.id) === String(selectedClassId));
    return selectedClass?.sections || [];
  }, [classes, selectedClassId]);

  async function onSubmit(values) {
    try {
      const payload = {
        ...values,
        rollNumber: values.rollNumber || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender || undefined
      };
      await createStudent.mutateAsync(payload);
      toast.success('Student created successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Student" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Full name"
          placeholder="Jane Doe"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Admission number"
          placeholder="ADM-2026-001"
          error={errors.admissionNumber?.message}
          {...register('admissionNumber')}
        />
        <Input label="Roll number" placeholder="21" error={errors.rollNumber?.message} {...register('rollNumber')} />
        <Input label="Date of birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
        <Select label="Gender" error={errors.gender?.message} {...register('gender')} defaultValue="">
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </Select>
        <Select label="Class" error={errors.classId?.message} {...register('classId')} defaultValue="">
          <option value="">Select class</option>
          {classes?.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))}
        </Select>
        <Select label="Section" error={errors.sectionId?.message} {...register('sectionId')} defaultValue="">
          <option value="">Select section</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </Select>

        <div className="col-span-full mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createStudent.isPending}>
            Create Student
          </Button>
        </div>
      </form>
    </Modal>
  );
}
