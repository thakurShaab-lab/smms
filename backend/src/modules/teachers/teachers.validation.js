import { z } from 'zod';

export const createTeacherSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    fullName: z.string().min(2).max(150),
    employeeCode: z.string().min(2).max(50),
    phone: z.string().min(6).max(20).optional()
  })
});

export const updateTeacherSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(150).optional(),
    phone: z.string().min(6).max(20).optional(),
    status: z.enum(['active', 'suspended', 'invited']).optional()
  }),
  params: z.object({
    id: z.coerce.number().int().positive()
  })
});

export const listTeachersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    search: z.string().optional()
  })
});

export const teacherIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  })
});
