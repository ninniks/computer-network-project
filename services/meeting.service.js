import pkg from 'rrule';
const { rrulestr } = pkg;
import * as meetingDal from '../dal/meeting.dal.js';
import * as attendanceDal from '../dal/attendance.dal.js';

// --- RRULE Expansion ---

function expandOccurrences(meeting, rangeStart, rangeEnd) {
  if (!meeting.recurrenceRule) {
    return (meeting.startDateTime >= rangeStart && meeting.startDateTime <= rangeEnd)
      ? [{ start: meeting.startDateTime, end: meeting.endDateTime }]
      : [];
  }

  const ruleSet = rrulestr(meeting.recurrenceRule, { forceset: true });
  const duration = meeting.endDateTime - meeting.startDateTime;

  return ruleSet.between(rangeStart, rangeEnd, true)
    .map(start => ({ start, end: new Date(start.getTime() + duration) }));
}

// --- RSVP Operations ---

export async function rsvpSingle(meetingId, userId, occurrenceStart, status) {
  await meetingDal.updateParticipantDefaultStatus(meetingId, userId, status);
  return attendanceDal.upsertAttendance(meetingId, userId, occurrenceStart, status);
}

export async function rsvpAll(meetingId, userId, status) {
  await meetingDal.updateParticipantDefaultStatus(meetingId, userId, status);
  await attendanceDal.deleteByMeetingAndUser(meetingId, userId);
}

// --- Meeting CRUD ---

export async function createMeeting(meetingData) {
  return meetingDal.createMeeting(meetingData);
}

export async function getMeetingById(id) {
  return meetingDal.findById(id);
}

export async function getMeetingsByDateRange(rangeStart, rangeEnd) {
  const meetings = await meetingDal.findByDateRange(rangeStart, rangeEnd);

  return meetings.flatMap(meeting => {
    const occurrences = expandOccurrences(meeting, rangeStart, rangeEnd);
    return occurrences.map(occ => ({
      meeting,
      start: occ.start,
      end: occ.end
    }));
  });
}

export async function getMeetingsByParticipant(userId) {
  return meetingDal.findByParticipant(userId);
}

export async function updateMeeting(id, updateData) {
  return meetingDal.updateMeeting(id, updateData);
}

export async function deleteMeeting(id) {
  await attendanceDal.deleteByMeeting(id);
  return meetingDal.deleteMeeting(id);
}

export async function addParticipant(meetingId, userId, defaultStatus) {
  return meetingDal.addParticipant(meetingId, userId, defaultStatus);
}

export async function removeParticipant(meetingId, userId) {
  await attendanceDal.deleteByMeetingAndUser(meetingId, userId);
  return meetingDal.removeParticipant(meetingId, userId);
}
