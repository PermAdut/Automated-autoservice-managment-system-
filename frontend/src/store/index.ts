import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import employeeReducer from './slices/employeeSlice';
import orderReducer from './slices/orderSlice';
import serviceReducer from './slices/servicesSlice'
import storeReducer from './slices/storeSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    employee: employeeReducer,
    order: orderReducer,
    service: serviceReducer,
    store: storeReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;