import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface SteelgradeState {
  items: string[];
  allGrades: string[];
}

const initialState: SteelgradeState = {
  items: [],
  allGrades: [],
}

const steelgradeSlice = createSlice({
  name: 'steelgrade',
  initialState,
  reducers: {
    updateSelectedGrades: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
    updateAllGrades: (state, action: PayloadAction<string[]>) => {
      state.allGrades = action.payload;
    },
    reset: (state) => {
      state.items = [];
      state.allGrades = [];
    }
  }
});

export const { updateSelectedGrades, updateAllGrades, reset } = steelgradeSlice.actions;

export const selectSteelgrade = (state: RootState) => state.steelGrade.items;
export const selectAllGrades = (state: RootState) => state.steelGrade.allGrades;

export default steelgradeSlice.reducer;