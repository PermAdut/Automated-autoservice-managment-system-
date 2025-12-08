import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { serverConfig } from "../../configs/serverConfig";

interface SparePartStock {
  id: number; // ID склада
  quantity: number;
  sparePart: {
    id: number;
    name: string;
    price: number;
    partNumber: string;
    category: {
      id: number;
      name: string;
      description: string;
    };
  };
  location: string;
}

interface SparePartStockState {
  spareParts: SparePartStock[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SparePartStockState = {
  spareParts: [],
  isLoading: false,
  error: null,
};

export const fetchSparePartsStock = createAsyncThunk(
  "spareParts/fetchSparePartsStock",
  async (
    params: { search?: string; sortOrder?: "asc" | "desc" } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `${serverConfig.url}/api/v1.0/stores`,
        {
          params: {
            search: params?.search,
            sortBy: "name",
            sortOrder: params?.sortOrder ?? "asc",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue("Failed to fetch spare parts stock");
    }
  }
);

const sparePartStockSlice = createSlice({
  name: "spareParts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSparePartsStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSparePartsStock.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spareParts = action.payload;
      })
      .addCase(fetchSparePartsStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default sparePartStockSlice.reducer;
