import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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
  async (
    params: { search?: string; sortOrder?: "asc" | "desc" } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/v1.0/services`,
        {
          params: {
            search: params?.search,
            sortBy: "name",
            sortOrder: params?.sortOrder ?? "asc",
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      console.log(error);
      return rejectWithValue("Failed to fetch services");
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
        const payload = Array.isArray(action.payload)
          ? action.payload
          : (action.payload as { data?: Services[] })?.data ?? [];
        state.services = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default serviceSlice.reducer;
