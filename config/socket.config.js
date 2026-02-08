import * as notificationDal from '../dal/notification.dal.js';

export function configureSocket(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;

    if (!userId) {
      console.warn('Socket connected without userId, skipping room join');
      return;
    }

    socket.join(`user:${userId}`);
    console.info(`Socket ${socket.id} joined room user:${userId}`);

    // Catchup: send unacknowledged notifications
    notificationDal.findUnacknowledged(userId).then((notifications) => {
      for (const notification of notifications) {
        socket.emit('notification', notification);
      }
    });

    socket.on('disconnect', () => {
      console.info(`Socket ${socket.id} (user:${userId}) disconnected`);
    });
  });
}
