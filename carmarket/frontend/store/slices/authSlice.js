import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../lib/api';

// Thunks
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { detail: 'Registration failed' });
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { detail: 'Login failed' });
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.getProfile();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.updateProfile(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    initAuth: (state) => {
      if (typeof window !== 'undefined') {
        const access = localStorage.getItem('access_token');
        const refresh = localStorage.getItem('refresh_token');
        const user = localStorage.getItem('user');
        if (access && user) {
          state.accessToken = access;
          state.refreshToken = refresh;
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(registerUser.fulfilled, (s, { payload }) => {
      s.loading = false;
      s.user = payload.user;
      s.accessToken = payload.access;
      s.refreshToken = payload.refresh;
      s.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', payload.access);
        localStorage.setItem('refresh_token', payload.refresh);
        localStorage.setItem('user', JSON.stringify(payload.user));
      }
    });
    builder.addCase(registerUser.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });

    // Login
    builder.addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; });
    builder.addCase(loginUser.fulfilled, (s, { payload }) => {
      s.loading = false;
      s.user = payload.user;
      s.accessToken = payload.access;
      s.refreshToken = payload.refresh;
      s.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', payload.access);
        localStorage.setItem('refresh_token', payload.refresh);
        localStorage.setItem('user', JSON.stringify(payload.user));
      }
    });
    builder.addCase(loginUser.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });

    // Fetch profile
    builder.addCase(fetchProfile.fulfilled, (s, { payload }) => {
      s.user = payload;
      if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(payload));
    });

    // Update profile
    builder.addCase(updateProfile.fulfilled, (s, { payload }) => {
      s.user = payload;
      if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(payload));
    });
  },
});

export const { initAuth, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
