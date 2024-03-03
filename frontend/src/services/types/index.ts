import { ThunkAction } from 'redux-thunk';
import { Action, ActionCreator } from 'redux';
import store from '../store';
import { TUserActions } from '../actions/user';
import { TPriceitemsActions } from '../actions/priceItems';
import { TProfileModalActions } from '../actions/profileModal';

type TApplicationActions =
  | TUserActions
  | TPriceitemsActions
  | TProfileModalActions;
// | TBurgerActions
// | TFeedActions
// | TIngredientDetailsModalActions

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ActionCreator<
  ThunkAction<ReturnType, Action, RootState, TApplicationActions>
>;
