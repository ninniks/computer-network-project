import { z } from 'zod';

export const objectIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const isoDateSchema = z.string().datetime();

export const objectIdParams = z.object({
  params: z.object({ id: objectIdSchema })
});
