import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  username: string;
  rolename: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
      state.error = null;
      // Guardar token en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.loading = false;
      state.error = null;
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    restoreAuth: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    refreshToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      // Actualizar token en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload);
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, restoreAuth, refreshToken } = authSlice.actions;
export default authSlice.reducer;
