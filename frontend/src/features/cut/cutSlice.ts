import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TPriceItemExtended } from '../../utils/types';
import { RootState } from '../../app/store';

export interface CutState {
  items: Array<TPriceItemExtended>;
}

const initialState: CutState = {
  items: [],
}

export const cutSlice = createSlice({
  name: 'cut',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ item: TPriceItemExtended }>) => {
      state.items.push(action.payload.item);
    },
    removeItem: (state, action: PayloadAction<{ id: string }>) => {
      const idx = state.items.findIndex((item) => item.id === action.payload.id);
      state.items.splice(idx, 1);
    }
  }
});

export const selectCut = (state: RootState) => state.cut;

export const { addItem, removeItem } = cutSlice.actions;

export default cutSlice.reducer;