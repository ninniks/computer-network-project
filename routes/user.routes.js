import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import * as s from '../validation/schemas/user.schemas.js';

const router = Router();

router.get('/api/v1/users/search', requireAuth, validate(s.searchUsers), userController.searchUsers);

export default router;
