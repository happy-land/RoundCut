import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface DiameterState {
  items: string[]; 
}

const initialState: DiameterState = {
  items: [],
}

const diameterSlice = createSlice({
  name: 'diameter',
  initialState,
  reducers: {
    updateSelectedDiameters: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
    reset: (state) => {
      state.items = []; // Reset the items to an empty array
    }
  }
});

export const { updateSelectedDiameters, reset } = diameterSlice.actions;

export const selectDiameter = (state: RootState) => state.diameter.items;

export default diameterSlice.reducer;