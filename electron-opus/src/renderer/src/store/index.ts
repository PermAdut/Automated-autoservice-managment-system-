import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import { tenantApi } from "../api/tenantApi";
import authReducer from "./slices/authSlice";
import tenantReducer from "./slices/tenantSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [tenantApi.reducerPath]: tenantApi.reducer,
    auth: authReducer,
    tenant: tenantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(tenantApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
