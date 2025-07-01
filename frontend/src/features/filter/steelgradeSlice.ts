import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface SteelgradeState {
  items: string[]; 
}

const initialState: SteelgradeState = {
  items: [],
}

const steelgradeSlice = createSlice({
  name: 'steelgrade',
  initialState,
  reducers: {
    updateSelectedGrades: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
    reset: (state) => {
      state.items = []; // Reset the items to an empty array
    }
  }
});

export const { updateSelectedGrades, reset } = steelgradeSlice.actions;

export const selectSteelgrade = (state: RootState) => state.steelGrade.items;

export default steelgradeSlice.reducer;