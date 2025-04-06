import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import employeeReducer from './slices/employeeSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    employee: employeeReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;