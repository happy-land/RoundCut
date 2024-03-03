// "react-redux": "^7.2.4", как в тренажере
import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook,
} from 'react-redux';
import { AppDispatch, AppThunk, RootState } from '../services/types';

export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;
export const useDispatch = () => dispatchHook<AppDispatch | AppThunk>();