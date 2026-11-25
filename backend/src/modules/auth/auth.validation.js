import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8).max(128)
  })
});
