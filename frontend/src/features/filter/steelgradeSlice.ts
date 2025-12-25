import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface SteelgradeState {
  selectedGrades: string[];
  availableGrades: string[];
}

const initialState: SteelgradeState = {
  selectedGrades: [],
  availableGrades: [],
}

const steelgradeSlice = createSlice({
  name: 'steelgrade',
  initialState,
  reducers: {
    updateActiveGrades: (state, action: PayloadAction<string[]>) => {
      state.selectedGrades = action.payload;
    },
    updateAllGrades: (state, action: PayloadAction<string[]>) => {
      state.availableGrades = action.payload;
    },
    reset: (state) => {
      state.selectedGrades = [];
      state.availableGrades = [];
    }
  }
});

export const { updateActiveGrades, updateAllGrades, reset } = steelgradeSlice.actions;

export const selectActiveGrades = (state: RootState) => state.steelGrade.selectedGrades;
export const selectAvailableGrades = (state: RootState) => state.steelGrade.availableGrades;

export default steelgradeSlice.reducer;