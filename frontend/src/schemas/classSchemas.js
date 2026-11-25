import { z } from 'zod';

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(50),
  displayOrder: z.coerce.number().int().optional()
});

export const sectionSchema = z.object({
  classId: z.coerce.number({ invalid_type_error: 'Class is required' }).int().positive('Class is required'),
  name: z.string().min(1, 'Section name is required').max(50)
});
