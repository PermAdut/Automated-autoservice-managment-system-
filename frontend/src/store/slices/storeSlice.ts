import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
//import axios from "axios";

interface Store {
    id: number;
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
        }
    };
    location: string;
}

interface StoreState {
    stores: Store[];
    isLoading: boolean;
    error: string | null;
}

export const fetchStores = createAsyncThunk('stores/fetchStores', async (_, { rejectWithValue }) => {
    try {
        const mockStores: Store[] = [
            {
                id: 1,
                quantity: 10,
                sparePart: {
                    id: 1,
                    name: "Тормозные колодки",
                    price: 2500,
                    partNumber: "BP-1234",
                    category: {
                        id: 1,
                        name: "Тормозная система",
                        description: "Детали тормозной системы"
                    }
                },
                location: "Склад А"
            },
            {
                id: 2,
                quantity: 5,
                sparePart: {
                    id: 2, 
                    name: "Масляный фильтр",
                    price: 500,
                    partNumber: "OF-5678",
                    category: {
                        id: 2,
                        name: "Фильтры",
                        description: "Фильтры для обслуживания"
                    }
                },
                location: "Склад Б"
            }
        ];
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return mockStores;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const storeSlice = createSlice({
    name: 'stores',
    initialState: {
        stores: [],
        isLoading: false,
        error: null
    } as StoreState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchStores.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchStores.fulfilled, (state, action) => {
            state.isLoading = false;
            state.stores = action.payload;
        });
        builder.addCase(fetchStores.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });
    }
});

export default storeSlice.reducer;