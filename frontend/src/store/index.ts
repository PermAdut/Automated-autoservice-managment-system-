import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import employeeReducer from './slices/employeeSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    employee: employeeReducer,
    order: orderReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;