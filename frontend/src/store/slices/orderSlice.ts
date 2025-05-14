import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { serverConfig } from '../../configs/serverConfig';

interface Order {
  id: number;
  userId: number;
  carId: number | null;
  employeeId: number | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
  services: {
    id: number;
    name: string;
    description: string;
    price: number;
  }[];
  sparePart: {
    id: number;
    name: string;
    partNumber: string;
    price: number;
    categorie: {
      id: number;
      name: string;
      description: string;
    };
  }[];
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  isLoading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${serverConfig.url}/api/v1.0/orders`);
      return response.data;
    } catch {
      return rejectWithValue('Failed to fetch orders');
    }
  },
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default orderSlice.reducer;