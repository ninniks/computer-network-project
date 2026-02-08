import { Router } from 'express';
import * as meetingController from '../controllers/meeting.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import * as s from '../validation/schemas/meeting.schemas.js';

export default (io) => {
  const router = Router();

  // Meeting CRUD
  router.post('/api/v1/meetings', requireAuth, validate(s.createMeeting), meetingController.createMeeting(io));
  router.get('/api/v1/meetings', requireAuth, validate(s.getMeetingsByDateRange), meetingController.getMeetingsByDateRange);
  router.get('/api/v1/meetings/:id', requireAuth, validate(s.getMeetingById), meetingController.getMeetingById);
  router.put('/api/v1/meetings/:id', requireAuth, validate(s.updateMeeting), meetingController.updateMeeting(io));
  router.delete('/api/v1/meetings/:id', requireAuth, validate(s.deleteMeeting), meetingController.deleteMeeting(io));

  // Current user's meetings
  router.get('/api/v1/users/me/meetings', requireAuth, meetingController.getMyMeetings);

  // RSVP
  router.post('/api/v1/meetings/:id/rsvp', requireAuth, validate(s.rsvpSingle), meetingController.rsvpSingle(io));
  router.post('/api/v1/meetings/:id/rsvp/all', requireAuth, validate(s.rsvpAll), meetingController.rsvpAll(io));

  // Participants
  router.post('/api/v1/meetings/:id/participants', requireAuth, validate(s.addParticipant), meetingController.addParticipant(io));
  router.delete('/api/v1/meetings/:id/participants', requireAuth, validate(s.removeParticipant), meetingController.removeParticipant(io));

  return router;
};
