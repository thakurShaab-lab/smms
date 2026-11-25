import { z } from 'zod';

export const uploadMediaSchema = z.object({
  body: z.object({
    classId: z.coerce.number().int().positive().optional(),
    sectionId: z.coerce.number().int().positive().optional(),
    capturedAt: z.string().datetime().optional()
  })
});

export const listMediaSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    studentId: z.coerce.number().int().positive().optional(),
    classId: z.coerce.number().int().positive().optional(),
    sectionId: z.coerce.number().int().positive().optional(),
    mediaType: z.enum(['photo', 'video', 'document', 'audio']).optional(),
    status: z.enum(['uploaded', 'processing', 'completed', 'failed']).optional()
  })
});

export const mediaIdParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const manualMappingSchema = z.object({
  body: z.object({ studentId: z.coerce.number().int().positive() }),
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const removeMappingParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    studentId: z.coerce.number().int().positive()
  })
});
