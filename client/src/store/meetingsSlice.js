import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchMeetingsByRange = createAsyncThunk(
  'meetings/fetchByRange',
  async ({ start, end }) => {
    const res = await api.get('/api/v1/meetings', {
      params: { start, end },
    });
    return res.data;
  }
);

export const fetchMeetingById = createAsyncThunk(
  'meetings/fetchById',
  async (id) => {
    const res = await api.get(`/api/v1/meetings/${id}`);
    return res.data;
  }
);

export const createMeeting = createAsyncThunk(
  'meetings/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/v1/meetings', data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateMeeting = createAsyncThunk(
  'meetings/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/v1/meetings/${id}`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteMeeting = createAsyncThunk(
  'meetings/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/meetings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const rsvpSingle = createAsyncThunk(
  'meetings/rsvpSingle',
  async ({ id, occurrenceStart, status }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/v1/meetings/${id}/rsvp`, {
        occurrenceStart,
        status,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const rsvpAll = createAsyncThunk(
  'meetings/rsvpAll',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/v1/meetings/${id}/rsvp/all`, { status });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const addParticipant = createAsyncThunk(
  'meetings/addParticipant',
  async ({ id, userId, defaultStatus }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/v1/meetings/${id}/participants`, {
        userId,
        defaultStatus,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const removeParticipant = createAsyncThunk(
  'meetings/removeParticipant',
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/api/v1/meetings/${id}/participants`, {
        data: { userId },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'meetings/searchUsers',
  async (query) => {
    const res = await api.get('/api/v1/users/search', {
      params: { q: query },
    });
    return res.data;
  }
);

const initialState = {
  occurrences: [],
  loading: false,
  error: null,
  activeMeeting: null,
  saving: false,
  userSearchResults: [],
  userSearchLoading: false,
  pendingOpenMeetingId: null,
};

const meetingsSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    clearActiveMeeting: (state) => {
      state.activeMeeting = null;
    },
    setPendingOpenMeetingId: (state, action) => {
      state.pendingOpenMeetingId = action.payload;
    },
    clearPendingOpenMeetingId: (state) => {
      state.pendingOpenMeetingId = null;
    },
    applySocketUpdate: (state, action) => {
      const meeting = action.payload;
      state.occurrences = state.occurrences.map((occ) =>
        occ.meeting._id === meeting._id ? { ...occ, meeting } : occ
      );
      if (state.activeMeeting?._id === meeting._id) {
        state.activeMeeting = meeting;
      }
    },
    removeMeetingFromList: (state, action) => {
      const id = action.payload;
      state.occurrences = state.occurrences.filter(
        (occ) => occ.meeting._id !== id
      );
      if (state.activeMeeting?._id === id) {
        state.activeMeeting = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMeetingsByRange
      .addCase(fetchMeetingsByRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetingsByRange.fulfilled, (state, action) => {
        state.occurrences = action.payload;
        state.loading = false;
      })
      .addCase(fetchMeetingsByRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchMeetingById
      .addCase(fetchMeetingById.fulfilled, (state, action) => {
        state.activeMeeting = action.payload;
      })
      // createMeeting
      .addCase(createMeeting.pending, (state) => {
        state.saving = true;
      })
      .addCase(createMeeting.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createMeeting.rejected, (state) => {
        state.saving = false;
      })
      // updateMeeting
      .addCase(updateMeeting.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateMeeting.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateMeeting.rejected, (state) => {
        state.saving = false;
      })
      // deleteMeeting
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.occurrences = state.occurrences.filter(
          (occ) => occ.meeting._id !== action.payload
        );
      })
      // searchUsers
      .addCase(searchUsers.pending, (state) => {
        state.userSearchLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.userSearchResults = action.payload;
        state.userSearchLoading = false;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.userSearchLoading = false;
      });
  },
});

export const { clearActiveMeeting, applySocketUpdate, removeMeetingFromList, setPendingOpenMeetingId, clearPendingOpenMeetingId } =
  meetingsSlice.actions;
export default meetingsSlice.reducer;
