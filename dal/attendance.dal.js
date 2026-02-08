import Attendance from '../models/Attendance.model.js';

export const upsertAttendance = async (meeting, user, occurrenceStart, status) => {
  return Attendance.findOneAndUpdate(
    { meeting, user, occurrenceStart },
    { status },
    { upsert: true, new: true }
  );
};

export const deleteByMeetingAndUser = async (meeting, user) => {
  return Attendance.deleteMany({ meeting, user });
};

export const deleteByMeeting = async (meeting) => {
  return Attendance.deleteMany({ meeting });
};

export const findByMeetingUserOccurrence = async (meeting, user, occurrenceStart) => {
  return Attendance.findOne({ meeting, user, occurrenceStart });
};

