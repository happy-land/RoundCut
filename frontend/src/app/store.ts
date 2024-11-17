import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';
import { priceApi } from '../services/priceApi';
import { warehouseApi } from '../services/warehouseApi';
import { markupApi } from '../services/markupApi';
// import { csvApi } from '../services/csvApi';
import authReducer from '../features/authSlice';
import cutReducer from '../features/cut/cutSlice';
import warehouseReducer from '../features/warehouse/warehouseSlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import { adminCutApi } from '../services/adminCutApi';
// import priceitemsReducer from '../features/price/priceitemsSlice';
// import usersReducer from '../features/users/usersSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    cut: cutReducer,
    warehouse: warehouseReducer,
    [authApi.reducerPath]: authApi.reducer,
    [priceApi.reducerPath]: priceApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
    [markupApi.reducerPath]: markupApi.reducer,
    [adminCutApi.reducerPath]: adminCutApi.reducer,
    // [csvApi.reducerPath]: csvApi.reducer,
    // priceitems: priceitemsReducer,
    // users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    // getDefaultMiddleware().concat(authApi.middleware, apiSlice.middleware)
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(priceApi.middleware)
      .concat(warehouseApi.middleware)
      .concat(markupApi.middleware)
      .concat(adminCutApi.middleware)
      // .concat(csvApi.middleware),
});

export default store;

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
setupListeners(store.dispatch);
