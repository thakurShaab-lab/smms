import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    admissionNumber: z.string().min(1).max(50),
    rollNumber: z.string().max(20).optional(),
    fullName: z.string().min(2).max(150),
    dateOfBirth: z.string().date().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    classId: z.coerce.number().int().positive(),
    sectionId: z.coerce.number().int().positive()
  })
});

export const updateStudentSchema = z.object({
  body: z.object({
    rollNumber: z.string().max(20).optional(),
    fullName: z.string().min(2).max(150).optional(),
    dateOfBirth: z.string().date().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    classId: z.coerce.number().int().positive().optional(),
    sectionId: z.coerce.number().int().positive().optional(),
    status: z.enum(['active', 'graduated', 'transferred', 'inactive']).optional()
  }),
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const listStudentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    search: z.string().optional(),
    classId: z.coerce.number().int().positive().optional(),
    sectionId: z.coerce.number().int().positive().optional()
  })
});

export const studentIdParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const faceIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    faceId: z.coerce.number().int().positive()
  })
});

export const voiceIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    voiceId: z.coerce.number().int().positive()
  })
});
