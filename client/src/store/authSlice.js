import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { clearAccessToken, refreshToken } from '../services/auth';

export const fetchUser = createAsyncThunk('auth/fetchUser', async () => {
  const res = await api.get('/api/v1/users/me');
  return res.data;
});

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    try {
      await refreshToken();
      return dispatch(fetchUser()).unwrap();
    } catch {
      return null;
    }
  }
);

const initialState = {
  data: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.data = action.payload || null;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      clearAccessToken();
      state.data = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.data = action.payload || null;
        state.isAuthenticated = !!action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.data = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload === null) {
          state.data = null;
          state.isAuthenticated = false;
          state.loading = false;
          state.error = null;
        }
        // Se payload non è null, fetchUser handlers hanno già gestito lo state
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.data = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
