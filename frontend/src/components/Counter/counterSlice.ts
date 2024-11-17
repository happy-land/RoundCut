import { createSlice } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../../app/store';
// import { getPriceitemsRequest } from '../../utils/api';

export interface CounterState {
  value: number;
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    updateByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount, updateByAmount } = counterSlice.actions;

// thunk
export const incrementAsync = (amount: number) => (dispatch: AppDispatch) => {
  setTimeout(() => {
    dispatch(incrementByAmount(amount));
  }, 1000);
};

// thunk
export const updateCounterAsync = (amount: number) => (dispatch: AppDispatch) => {
  setTimeout(() => {
    dispatch(updateByAmount(amount));
  }, 1000);
};

// export const fetchPrice = () => {
//   return async (dispatch, getState) => {
//     try {
//       const price = getPriceitemsRequest();
//     } catch (err) {
//       console.log(err);
//     }
//   }
// }

export const selectCount = (state: RootState) => state.counter.value;

export default counterSlice.reducer;
