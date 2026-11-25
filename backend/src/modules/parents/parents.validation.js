import { z } from 'zod';

export const createParentSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(150),
    phone: z.string().min(6).max(20).optional(),
    email: z.string().email().optional(),
    createLogin: z.boolean().optional().default(false),
    password: z.string().min(8).max(128).optional(),
    studentIds: z.array(z.coerce.number().int().positive()).optional().default([]),
    relationship: z.enum(['father', 'mother', 'guardian']).optional().default('guardian')
  })
});

export const updateParentSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(150).optional(),
    phone: z.string().min(6).max(20).optional(),
    email: z.string().email().optional()
  }),
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const linkStudentSchema = z.object({
  body: z.object({
    studentId: z.coerce.number().int().positive(),
    relationship: z.enum(['father', 'mother', 'guardian']).default('guardian')
  }),
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const parentIdParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const listParentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    search: z.string().optional()
  })
});
