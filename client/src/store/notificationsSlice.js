import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async () => {
    const res = await api.get('/api/v1/notifications');
    return res.data;
  }
);

export const acknowledgeNotification = createAsyncThunk(
  'notifications/acknowledge',
  async (id) => {
    await api.patch(`/api/v1/notifications/${id}/ack`);
    return id;
  }
);

export const acknowledgeAllNotifications = createAsyncThunk(
  'notifications/acknowledgeAll',
  async () => {
    await api.patch('/api/v1/notifications/ack-all');
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      const exists = state.items.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(acknowledgeNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
      })
      .addCase(acknowledgeAllNotifications.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
