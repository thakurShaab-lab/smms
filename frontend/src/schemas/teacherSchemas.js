import { z } from 'zod';

export const createTeacherSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(150),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  employeeCode: z.string().min(2, 'Employee code is required').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().max(20).optional().or(z.literal(''))
});
