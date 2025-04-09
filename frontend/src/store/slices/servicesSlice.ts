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
      // Заглушка: массив услуг
      const mockServices: Services[] = [
        {
          id: 1,
          name: "Замена масла",
          description: "Полная замена моторного масла и масляного фильтра",
          price: 3500,
        },
        {
          id: 2,
          name: "Диагностика двигателя",
          description: "Комплексная проверка работы двигателя",
          price: 2000,
        },
        {
          id: 3,
          name: "Замена тормозных колодок",
          description: "Установка новых тормозных колодок на переднюю ось",
          price: 4500,
        },
        {
          id: 4,
          name: "Шиномонтаж",
          description: "Сезонная замена шин с балансировкой",
          price: 3000,
        },
        {
          id: 5,
          name: "Ремонт подвески",
          description: "Диагностика и ремонт элементов подвески",
          price: 6000,
        },
      ];
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return mockServices;
    } catch {
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
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default serviceSlice.reducer;