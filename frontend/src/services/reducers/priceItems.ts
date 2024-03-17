import { TPriceitemsActions } from '../actions/priceItems';
import {
  GET_PRICEITEMS_FAIL,
  GET_PRICEITEMS_REQUEST,
  GET_PRICEITEMS_SUCCESS,
} from '../constants';
import { TPriceItem } from '../types/data';

type TPriceitemsState = {
  items: Array<TPriceItem>;
  isLoading: boolean;
  hasError: boolean;
};

const priceitemsInitialState: TPriceitemsState = {
  items: [],
  isLoading: false,
  hasError: false,
};

export const priceitemsReducer = (
  state = priceitemsInitialState,
  action: TPriceitemsActions,
) => {
  switch (action.type) {
    case GET_PRICEITEMS_REQUEST: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case GET_PRICEITEMS_SUCCESS: {
      return {
        ...state,
        items: action.payload,
        isLoading: false,
        hasError: false,
      };
    }
    case GET_PRICEITEMS_FAIL: {
      return {
        ...state,
        isLoading: false,
        hasError: true,
      };
    }
    default: {
      return state;
    }
  }
};
