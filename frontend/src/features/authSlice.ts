import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { TOwnUserData } from '../utils/types';
import { deleteCookie } from '../utils/cookie';

export interface AuthState {
  // name: string | null;
  user: TOwnUserData | null; 
  token: string | null;
}

const initialState: AuthState = {
  // name: null,
  user: null,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: TOwnUserData; token: string }>,
    ) => {
      localStorage.setItem(
        'userData',
        JSON.stringify({
          // name: action.payload.name,
          user: action.payload.user,
          token: action.payload.token,
        }),
      );
      // state.name = action.payload.name;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      localStorage.clear();
      deleteCookie('accessToken');
      state.user = null;
      state.token = null;
    }
  },
});

export const selectAuth = (state: RootState) => state.auth;

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;