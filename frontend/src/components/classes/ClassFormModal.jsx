'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { classSchema } from '@/schemas/classSchemas';
import { useCreateClass } from '@/hooks/useClasses';
import { extractErrorMessage } from '@/lib/axios';

export function ClassFormModal({ open, onClose }) {
  const createClass = useCreateClass();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ resolver: zodResolver(classSchema), defaultValues: { name: '', displayOrder: 0 } });

  async function onSubmit(values) {
    try {
      await createClass.mutateAsync(values);
      toast.success('Class created successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Class">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Class name" placeholder="Grade 5" error={errors.name?.message} {...register('name')} />
        <Input
          label="Display order"
          type="number"
          placeholder="0"
          error={errors.displayOrder?.message}
          {...register('displayOrder')}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createClass.isPending}>
            Create Class
          </Button>
        </div>
      </form>
    </Modal>
  );
}
