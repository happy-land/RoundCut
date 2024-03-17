import { combineReducers } from 'redux';
import { userReducer } from './user';
import { profileModalReducer } from './profileModal';
import { priceitemsReducer } from './priceItems';

export const rootReducer = combineReducers({
  user: userReducer,
  priceitems: priceitemsReducer,
  profileModal: profileModalReducer,
});
