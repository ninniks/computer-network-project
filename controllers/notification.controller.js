import * as notificationDal from '../dal/notification.dal.js';

export const getUnacknowledged = async (req, res) => {
  const notifications = await notificationDal.findUnacknowledged(req.user._id);
  res.json(notifications);
};

export const acknowledge = async (req, res) => {
  const notification = await notificationDal.acknowledge(req.params.id);
  if (!notification) return res.status(404).json({ error: 'NOTIFICATION_NOT_FOUND' });
  res.json(notification);
};

export const acknowledgeAll = async (req, res) => {
  const result = await notificationDal.acknowledgeAll(req.user._id);
  res.json({ acknowledged: result.modifiedCount });
};
