import { z } from 'zod';

export const createParentSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(150),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  createLogin: z.boolean().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal(''))
});

export const linkStudentSchema = z.object({
  studentId: z.coerce.number({ invalid_type_error: 'Select a student' }).int().positive('Select a student'),
  relationship: z.enum(['father', 'mother', 'guardian'])
});
