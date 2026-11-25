'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createParentSchema } from '@/schemas/parentSchemas';
import { useCreateParent } from '@/hooks/useParents';
import { extractErrorMessage } from '@/lib/axios';

export function ParentFormModal({ open, onClose }) {
  const createParent = useCreateParent();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({ resolver: zodResolver(createParentSchema), defaultValues: { createLogin: false } });

  const createLogin = watch('createLogin');

  async function onSubmit(values) {
    try {
      await createParent.mutateAsync({
        ...values,
        phone: values.phone || undefined,
        email: values.email || undefined,
        password: values.createLogin ? values.password : undefined
      });
      toast.success('Parent created successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Parent">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Full name" placeholder="Jane Parent" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Phone (optional)" placeholder="+1 555 000 2222" error={errors.phone?.message} {...register('phone')} />
        <Input label="Email" type="email" placeholder="parent@example.com" error={errors.email?.message} {...register('email')} />

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-900" {...register('createLogin')} />
          Create a portal login for this parent
        </label>

        {createLogin && (
          <Input
            label="Temporary password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createParent.isPending}>
            Create Parent
          </Button>
        </div>
      </form>
    </Modal>
  );
}
