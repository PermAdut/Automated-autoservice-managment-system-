import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TenantBranding } from "../../api/tenantApi";

interface TenantState {
  branding: TenantBranding | null;
  isLoaded: boolean;
}

const initialState: TenantState = {
  branding: null,
  isLoaded: false,
};

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setBranding(state, action: PayloadAction<TenantBranding>) {
      state.branding = action.payload;
      state.isLoaded = true;
    },
  },
});

export const { setBranding } = tenantSlice.actions;
export default tenantSlice.reducer;
