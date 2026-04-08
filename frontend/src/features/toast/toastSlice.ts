import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string | null;
  type: ToastType;
}

const initialState: ToastState = {
  message: null,
  type: 'success',
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<{ message: string; type?: ToastType }>) => {
      state.message = action.payload.message;
      state.type = action.payload.type ?? 'success';
    },
    hideToast: (state) => {
      state.message = null;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export const selectToast = (state: RootState) => state.toast;
export default toastSlice.reducer;
