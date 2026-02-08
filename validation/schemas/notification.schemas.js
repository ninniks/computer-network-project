import { z } from 'zod';
import { objectIdSchema } from './common.schemas.js';

export const acknowledgeNotification = z.object({
  params: z.object({ id: objectIdSchema }),
});
