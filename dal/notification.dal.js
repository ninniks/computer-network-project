import Notification from '../models/Notification.model.js';

export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return notification.save();
};

export const findUnacknowledged = async (userId) => {
  return Notification.find({ user: userId, ack: false }).sort({ createdAt: -1 });
};

export const acknowledge = async (notificationId) => {
  return Notification.findByIdAndUpdate(notificationId, { ack: true }, { new: true });
};

export const acknowledgeAll = async (userId) => {
  return Notification.updateMany({ user: userId, ack: false }, { ack: true });
};
