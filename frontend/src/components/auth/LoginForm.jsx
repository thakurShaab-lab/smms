'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { loginSchema } from '@/schemas/authSchemas';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { extractErrorMessage } from '@/lib/axios';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Email address"
        type="email"
        placeholder="you@school.edu"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
        Sign in
      </Button>
    </form>
  );
}
