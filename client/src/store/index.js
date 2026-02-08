import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import meetingsReducer from './meetingsSlice';
import notificationsReducer from './notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    meetings: meetingsReducer,
    notifications: notificationsReducer,
  },
});
