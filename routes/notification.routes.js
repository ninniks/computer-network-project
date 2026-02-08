import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import * as s from '../validation/schemas/notification.schemas.js';

const router = Router();

router.get('/api/v1/notifications', requireAuth, notificationController.getUnacknowledged);
router.patch('/api/v1/notifications/ack-all', requireAuth, notificationController.acknowledgeAll);
router.patch('/api/v1/notifications/:id/ack', requireAuth, validate(s.acknowledgeNotification), notificationController.acknowledge);

export default router;
