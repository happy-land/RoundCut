import { getPriceitemsRequest } from '../../utils/api';
import { GET_PRICEITEMS_FAIL, GET_PRICEITEMS_REQUEST, GET_PRICEITEMS_SUCCESS } from '../constants';
import { AppDispatch, AppThunk } from '../types';
import { TPriceItem } from '../types/data';

export interface IGetPriceitemsRequestAction {
  type: typeof GET_PRICEITEMS_REQUEST;
}

export interface IGetPriceitemsSuccessAction {
  type: typeof GET_PRICEITEMS_SUCCESS;
  payload: Array<TPriceItem>;
}

export interface IGetPriceitemsFailAction {
  type: typeof GET_PRICEITEMS_FAIL;
}

export type TPriceitemsActions =
  | IGetPriceitemsRequestAction
  | IGetPriceitemsSuccessAction
  | IGetPriceitemsFailAction;

export const getPriceItemsThunk: AppThunk = () => (dispatch: AppDispatch) => {
  dispatch({
    type: GET_PRICEITEMS_REQUEST,
    isLoading: true,
    hasError: false,
  });

  getPriceitemsRequest()
    .then((responseBody) => {
      dispatch({
        type: GET_PRICEITEMS_SUCCESS,
        payload: responseBody.data,
        isLoading: false,
        hasError: false,
      })
    })
    .catch((err) => {
      dispatch({
        type: GET_PRICEITEMS_FAIL,
        payload: err,
        isLoading: false,
        hasError: true,
      })
    });
};
