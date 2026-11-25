import { z } from 'zod';

export const studentSchema = z.object({
  admissionNumber: z.string().min(1, 'Admission number is required').max(50),
  rollNumber: z.string().max(20).optional().or(z.literal('')),
  fullName: z.string().min(2, 'Full name is required').max(150),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
  classId: z.coerce.number({ invalid_type_error: 'Class is required' }).int().positive('Class is required'),
  sectionId: z.coerce.number({ invalid_type_error: 'Section is required' }).int().positive('Section is required')
});
