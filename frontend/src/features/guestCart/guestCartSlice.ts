import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TCreateCartItemDto } from '../../utils/types';

export type TGuestCartItem = TCreateCartItemDto & { id: number };

interface GuestCartState {
  items: TGuestCartItem[];
}

const STORAGE_KEY = 'guestCart';

const loadFromStorage = (): TGuestCartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TGuestCartItem[]) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items: TGuestCartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — ignore
  }
};

const initialState: GuestCartState = {
  items: loadFromStorage(),
};

const guestCartSlice = createSlice({
  name: 'guestCart',
  initialState,
  reducers: {
    addGuestCartItem(state, action: PayloadAction<TCreateCartItemDto>) {
      const id = Date.now();
      state.items.push({ ...action.payload, id });
      saveToStorage(state.items);
    },

    removeGuestCartItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveToStorage(state.items);
    },

    clearGuestCart(state) {
      state.items = [];
      saveToStorage(state.items);
    },
  },
});

export const { addGuestCartItem, removeGuestCartItem, clearGuestCart } =
  guestCartSlice.actions;

export default guestCartSlice.reducer;
