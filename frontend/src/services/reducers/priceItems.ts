import { TPriceitemsActions } from '../actions/priceItems';
import { TPriceItem } from '../types/data';

type TPriceitemsState = {
  items: Array<TPriceItem>;
  isLoading: boolean;
  hasError: boolean;
}

const priceitemsInitialState: TPriceitemsState = {
  items: [],
  isLoading: false,
  hasError: false,
}

export const priceitemsReducer = (state = priceitemsInitialState, action: TPriceitemsActions) => {
  switch (action.type) {
    default: {
      return state;
    }
  }
}