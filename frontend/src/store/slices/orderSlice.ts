import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Order {
  id: number;
  userId: number;
  carId: string | null;
  employeeId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string;
  services?: {
    id: number;
    name: string;
    description: string;
    price: number;
  }[];
  sparePart?: {
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

export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const mockOrders: Order[] = [
        {
          id: 1,
          userId: 101,
          carId: "VIN12345678901234",
          employeeId: "1",
          status: "in_progress",
          createdAt: "2025-04-01T08:00:00Z",
          updatedAt: "2025-04-06T12:00:00Z",
          completedAt: "",
          services: [
            {
              id: 1,
              name: "Замена масла",
              description: "Замена моторного масла и фильтра",
              price: 3500,
            },
            {
              id: 2,
              name: "Диагностика двигателя",
              description: "Проверка состояния двигателя",
              price: 2000,
            },
          ],
          sparePart: [
            {
              id: 101,
              name: "Масляный фильтр",
              partNumber: "MF12345",
              price: 500,
              categorie: {
                id: 1,
                name: "Фильтры",
                description: "Запчасти для фильтрации",
              },
            },
          ],
        },
        {
          id: 2,
          userId: 102,
          carId: "VIN98765432109876",
          employeeId: "2",
          status: "completed",
          createdAt: "2025-03-25T10:00:00Z",
          updatedAt: "2025-03-30T15:00:00Z",
          completedAt: "2025-03-30T15:00:00Z",
          services: [
            {
              id: 3,
              name: "Замена тормозных колодок",
              description: "Установка новых тормозных колодок",
              price: 4500,
            },
          ],
          sparePart: [
            {
              id: 102,
              name: "Тормозные колодки",
              partNumber: "BP67890",
              price: 1500,
              categorie: {
                id: 2,
                name: "Тормозная система",
                description: "Компоненты тормозов",
              },
            },
          ],
        },
        {
          id: 3,
          userId: 103,
          carId: null,
          employeeId: null,
          status: "pending",
          createdAt: "2025-04-05T14:00:00Z",
          updatedAt: "2025-04-05T14:00:00Z",
          completedAt: "",
          services: [
            {
              id: 4,
              name: "Шиномонтаж",
              description: "Сезонная замена шин",
              price: 3000,
            },
          ],
          sparePart: [],
        },
      ];
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return mockOrders;
    } catch {
      return rejectWithValue("Failed to fetch orders");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    isLoading: false,
    error: null,
  } as OrderState,
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