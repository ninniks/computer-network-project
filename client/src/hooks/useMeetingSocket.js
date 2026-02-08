import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { config } from '../config';
import { applySocketUpdate, removeMeetingFromList } from '../store/meetingsSlice';
import { addNotification } from '../store/notificationsSlice';

export function useMeetingSocket(refetchRange) {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const refetchRef = useRef(refetchRange);
  const activeMeeting = useSelector((state) => state.meetings.activeMeeting);
  const activeMeetingRef = useRef(activeMeeting);
  const userId = useSelector((state) => state.auth.data?._id);

  useEffect(() => {
    refetchRef.current = refetchRange;
  }, [refetchRange]);

  useEffect(() => {
    activeMeetingRef.current = activeMeeting;
  }, [activeMeeting]);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(config.socketUrl, {
      transports: ['websocket'],
      auth: { userId },
    });

    socketRef.current.on('notification', (notification) => {
      dispatch(addNotification(notification));

      switch (notification.type) {
        case 'meeting_created':
          if (refetchRef.current) refetchRef.current();
          break;
        case 'meeting_updated':
          dispatch(applySocketUpdate(notification.message));
          if (refetchRef.current) refetchRef.current();
          break;
        case 'meeting_cancelled':
          dispatch(removeMeetingFromList(notification.message.id));
          break;
        case 'rsvp_updated':
          if (activeMeetingRef.current?._id === notification.message.meetingId) {
            if (refetchRef.current) refetchRef.current();
          }
          break;
        default:
          break;
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('notification');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [dispatch, userId]);

  return socketRef.current;
}
