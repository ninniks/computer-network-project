import * as meetingService from '../services/meeting.service.js';
import * as notificationService from '../services/notification.service.js';
import { SOCKET_EVENTS } from '../constants/meeting.constants.js';

export const createMeeting = (io) => async (req, res) => {
  const meetingData = {
    ...req.body,
    author: req.user._id
  };

  const meeting = await meetingService.createMeeting(meetingData);

  const targets = notificationService.getMeetingTargetUsers(meeting);
  await notificationService.notifyUsers(io, SOCKET_EVENTS.MEETING_CREATED, targets, req.user._id, meeting, meeting._id);

  res.status(201).json(meeting);
};

export const getMeetingById = async (req, res) => {
  const meeting = await meetingService.getMeetingById(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'MEETING_NOT_FOUND' });
  res.json(meeting);
};

export const getMeetingsByDateRange = async (req, res) => {
  const { start, end } = req.query;

  const occurrences = await meetingService.getMeetingsByDateRange(
    new Date(start),
    new Date(end)
  );
  res.json(occurrences);
};

export const getMyMeetings = async (req, res) => {
  const meetings = await meetingService.getMeetingsByParticipant(req.user._id);
  res.json(meetings);
};

export const updateMeeting = (io) => async (req, res) => {
  const meeting = await meetingService.updateMeeting(req.params.id, req.body);
  if (!meeting) return res.status(404).json({ error: 'MEETING_NOT_FOUND' });

  const targets = notificationService.getMeetingTargetUsers(meeting);
  await notificationService.notifyUsers(io, SOCKET_EVENTS.MEETING_UPDATED, targets, req.user._id, meeting, meeting._id);

  res.json(meeting);
};

export const deleteMeeting = (io) => async (req, res) => {
  // Fetch before deleting to get participant list
  const meetingBefore = await meetingService.getMeetingById(req.params.id);
  if (!meetingBefore) return res.status(404).json({ error: 'MEETING_NOT_FOUND' });

  await meetingService.deleteMeeting(req.params.id);

  const targets = notificationService.getMeetingTargetUsers(meetingBefore);
  await notificationService.notifyUsers(io, SOCKET_EVENTS.MEETING_CANCELLED, targets, req.user._id, { id: req.params.id }, meetingBefore._id);

  res.json({ success: true });
};

export const rsvpSingle = (io) => async (req, res) => {
  const { occurrenceStart, status } = req.body;

  const meeting = await meetingService.getMeetingById(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'MEETING_NOT_FOUND' });

  const attendance = await meetingService.rsvpSingle(
    req.params.id,
    req.user._id,
    new Date(occurrenceStart),
    status
  );

  const payload = { meetingId: req.params.id, userId: req.user._id, occurrenceStart, status };
  const targets = notificationService.getMeetingTargetUsers(meeting);
  await notificationService.notifyUsers(io, SOCKET_EVENTS.RSVP_UPDATED, targets, req.user._id, payload, meeting._id);

  res.json(attendance);
};

export const rsvpAll = (io) => async (req, res) => {
  const { status } = req.body;

  const meeting = await meetingService.getMeetingById(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'MEETING_NOT_FOUND' });

  await meetingService.rsvpAll(req.params.id, req.user._id, status);

  const payload = { meetingId: req.params.id, userId: req.user._id, status, bulk: true };
  const targets = notificationService.getMeetingTargetUsers(meeting);
  await notificationService.notifyUsers(io, SOCKET_EVENTS.RSVP_UPDATED, targets, req.user._id, payload, meeting._id);

  res.json({ success: true });
};

export const addParticipant = (io) => async (req, res) => {
  const { userId, defaultStatus } = req.body;
  const meeting = await meetingService.addParticipant(req.params.id, userId, defaultStatus);
  if (!meeting) return res.status(404).json({ error: 'MEETING_NOT_FOUND' });

  const targets = notificationService.getMeetingTargetUsers(meeting);
  await notificationService.notifyUsers(io, SOCKET_EVENTS.MEETING_UPDATED, targets, req.user._id, meeting, meeting._id);

  res.json(meeting);
};

export const removeParticipant = (io) => async (req, res) => {
  const { userId } = req.body;

  // Fetch before removal to include the removed user in targets
  const meetingBefore = await meetingService.getMeetingById(req.params.id);
  if (!meetingBefore) return res.status(404).json({ error: 'MEETING_NOT_FOUND' });

  const meeting = await meetingService.removeParticipant(req.params.id, userId);
  if (!meeting) return res.status(404).json({ error: 'MEETING_NOT_FOUND' });

  // Use meetingBefore so the removed participant still gets notified
  const targets = notificationService.getMeetingTargetUsers(meetingBefore);
  await notificationService.notifyUsers(io, SOCKET_EVENTS.MEETING_UPDATED, targets, req.user._id, meeting, meeting._id);

  res.json(meeting);
};
