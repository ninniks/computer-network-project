import { z } from 'zod';

export const searchUsers = z.object({
  query: z.object({
    q: z.string().min(1).max(100),
  }),
});
