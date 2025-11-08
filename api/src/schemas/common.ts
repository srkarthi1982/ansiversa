import { z } from 'zod';

export const idParam = z.object({
  id: z.string().regex(/^\d+$/, 'id must be numeric'),
});
