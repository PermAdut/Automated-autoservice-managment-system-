import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { serverConfig } from '../../configs/serverConfig';

interface Supplier {
    id: number;
    name: string;
    address: string;
    contact: string;
    positionsForBuying: {
      id: number;
      quantity: number;
      deliverDate: string;
      status: string;
    }[];
}

interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

const initialState: SupplierState = {
  suppliers: [],
  loading: false,
  error: null,
};

export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${serverConfig.url}/api/v1.0/supplier`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Симуляция задержки
      return response.data;
    } catch {
      return rejectWithValue('Failed to fetch suppliers');
    }
  },
);

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default suppliersSlice.reducer;