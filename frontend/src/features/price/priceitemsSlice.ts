import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { TPriceItem } from '../../utils/types';

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


