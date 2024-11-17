import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { TPriceItem } from '../../utils/types';
import { getPriceitemsRequest } from '../../utils/api';

type TPriceState = {
  items: Array<TPriceItem>;
};
const initialState: TPriceState = {
  items: [],
};

const priceitemsSlice = createSlice({
  name: 'priceitems',
  initialState,
  reducers: {
    priceitemAdded(state, action) {
      state.items.push(action.payload);
    },
    setPrice: (
      state,
      action: PayloadAction<{ items: Array<TPriceItem> }>,
    ) => {
      state.items = action.payload.items;
    },
  },
});

export const { priceitemAdded, setPrice } = priceitemsSlice.actions;

export default priceitemsSlice.reducer;

// пример initialState с дополнительными полями
export const selectAllItems = (state: RootState) => state.priceitems.items;

export const selectItemById = (state: RootState, itemId: string) => {
  return state.priceitems.items.find((item) => item.id === itemId);
};

