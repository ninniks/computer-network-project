import * as notificationDal from '../dal/notification.dal.js';

/**
 * Returns deduplicated string[] of user IDs from meeting's author + participants.
 */
export function getMeetingTargetUsers(meeting) {
  const ids = new Set();

  if (meeting.author) {
    ids.add(meeting.author._id?.toString() ?? meeting.author.toString());
  }

  if (meeting.participants) {
    for (const p of meeting.participants) {
      const uid = p.user?._id?.toString() ?? p.user?.toString();
      if (uid) ids.add(uid);
    }
  }

  return [...ids];
}

/**
 * Persists a notification for each target user (excluding actor), then emits
 * to online users via Socket.IO rooms.
 */
export async function notifyUsers(io, eventType, targetUserIds, actorUserId, payload, meetingId) {
  const actorStr = actorUserId?.toString();
  const uniqueTargets = [...new Set(targetUserIds)].filter((id) => id !== actorStr);

  for (const userId of uniqueTargets) {
    const notification = await notificationDal.createNotification({
      type: eventType,
      user: userId,
      meeting: meetingId,
      message: payload,
    });

    if (io.sockets.adapter.rooms.has(`user:${userId}`)) {
      io.to(`user:${userId}`).emit('notification', notification);
    }
  }
}
