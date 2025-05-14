import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Services {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface ServicesState {
  services: Services[];
  error: string | null;
  isLoading: boolean;
}

export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/v1.0/services`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await response.json();
    } catch (error: unknown) {
      console.log(error);
      return rejectWithValue('Failed to fetch services');
    }
  }
);

const serviceSlice = createSlice({
  name: "service",
  initialState: {
    services: [],
    error: null,
    isLoading: false,
  } as ServicesState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default serviceSlice.reducer;