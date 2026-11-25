'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { sectionSchema } from '@/schemas/classSchemas';
import { useCreateSection } from '@/hooks/useClasses';
import { extractErrorMessage } from '@/lib/axios';

export function SectionFormModal({ open, onClose, classId }) {
  const createSection = useCreateSection();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({ resolver: zodResolver(sectionSchema), defaultValues: { name: '', classId } });

  useEffect(() => {
    setValue('classId', classId);
  }, [classId, setValue]);

  async function onSubmit(values) {
    try {
      await createSection.mutateAsync(values);
      toast.success('Section created successfully');
      reset({ name: '', classId });
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Section" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input type="hidden" {...register('classId')} />
        <Input label="Section name" placeholder="Section A" error={errors.name?.message} {...register('name')} />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createSection.isPending}>
            Create Section
          </Button>
        </div>
      </form>
    </Modal>
  );
}
