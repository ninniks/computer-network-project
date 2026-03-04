import Meeting from '../models/Meeting.model.js';

export const findById = async (id) => {
  return Meeting.findById(id)
    .populate('author', 'name email photo')
    .populate('participants.user', 'name email photo');
};

export const findByDateRange = async (rangeStart, rangeEnd) => {
  return Meeting.find({
    startDateTime: { $lte: rangeEnd },
    endDateTime: { $gte: rangeStart }
  })
    .populate('author', 'name email photo')
    .populate('participants.user', 'name email photo');
};

export const findByParticipant = async (userId) => {
  return Meeting.find({ 'participants.user': userId });
};

export const createMeeting = async (meetingData) => {
  const meeting = new Meeting(meetingData);
  await meeting.save();
  await meeting.populate('author', 'name email photo');
  return meeting.populate('participants.user', 'name email photo');
};

export const updateMeeting = async (id, updateData) => {
  return Meeting.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteMeeting = async (id) => {
  return Meeting.findByIdAndDelete(id);
};

export const addParticipant = async (meetingId, userId, defaultStatus = 'maybe') => {
  return Meeting.findByIdAndUpdate(
    meetingId,
    { $push: { participants: { user: userId, defaultStatus } } },
    { new: true }
  );
};

export const removeParticipant = async (meetingId, userId) => {
  return Meeting.findByIdAndUpdate(
    meetingId,
    { $pull: { participants: { user: userId } } },
    { new: true }
  );
};

export const updateParticipantDefaultStatus = async (meetingId, userId, defaultStatus) => {
  return Meeting.findOneAndUpdate(
    { _id: meetingId, 'participants.user': userId },
    { $set: { 'participants.$.defaultStatus': defaultStatus } },
    { new: true }
  );
};
