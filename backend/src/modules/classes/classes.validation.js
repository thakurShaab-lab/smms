import { z } from 'zod';

export const createClassSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    displayOrder: z.number().int().optional()
  })
});

export const updateClassSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    displayOrder: z.number().int().optional()
  }),
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const createSectionSchema = z.object({
  body: z.object({
    classId: z.coerce.number().int().positive(),
    name: z.string().min(1).max(50)
  })
});

export const updateSectionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional()
  }),
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() })
});
