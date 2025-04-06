import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  id: number;
  name: string;
}

interface UserDetailed {
  id: number;
  role: { id: number; name: string };
  login: string;
  name: string;
  surName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
  passport?: {
    identityNumber: string;
    nationality: string;
    birthDate: string;
    gender: 'M' | 'F';
    expiriationDate: string;
  };
  subscriptions?: {
    subscriptionDescription: string;
    subscriptionName: string;
    dateStart: string;
    dateEnd: string;
  }[];
  reviews?: {
    description: string;
    rate: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  }[];
  cars?: {
    name: string;
    information: string;
    year: string;
    vin: string;
    licensePlate: string;
  }[];
  orders?: {
    id: number;
    status: string;
    createdAt: string;
    updateAt: string;
    completedAt: string;
  }[];
}

interface UserState {
  users: User[];
  loading: boolean;
  detailedUser: UserDetailed | null;
  error: string | null;
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/users');
      return response.data;
    } catch  {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const fetchUsersById = createAsyncThunk(
  'users/fetchUsersById',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`);
      const userData = response.data;
      const detailedUser: UserDetailed = {
        id: userData.id,
        role: { id: 1, name: 'Клиент' }, 
        login: `user${userData.id}`, 
        name: userData.name.split(' ')[0],
        surName: userData.name.split(' ')[1] || 'Unknown', 
        email: userData.email,
        phone: userData.phone || '+1234567890', 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        passport: {
          identityNumber: `PASS${userData.id}123`, 
          nationality: 'Russia', 
          birthDate: '1990-01-01T00:00:00Z', 
          gender: userData.id % 2 === 0 ? 'M' : 'F', 
          expiriationDate: '2030-01-01T00:00:00Z', 
        },
        subscriptions: [{
          subscriptionName: 'Premium Service',
          subscriptionDescription: 'Полное обслуживание авто',
          dateStart: new Date().toISOString(),
          dateEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
        }],
        reviews: [{
          description: 'Отличный сервис!',
          rate: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: '', 
        }],
        cars: [{
          name: 'Toyota Camry',
          information: 'Чёрный седан',
          year: '2018',
          vin: `VIN${userData.id}1234567890123`,
          licensePlate: `A${userData.id}BC123`,
        }],
        orders: [{
          id: userData.id * 100,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updateAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        }, {
          id: userData.id * 100,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updateAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        }, {
          id: userData.id * 100,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updateAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        }],
      };

      return detailedUser;
    } catch {
      return rejectWithValue('Failed to fetch user by ID');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    detailedUser:null,
    loading: false,
    error: null
  } as UserState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUsersById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersById.fulfilled, (state, action) => {
        state.loading = false;
        state.detailedUser = action.payload;
      })
      .addCase(fetchUsersById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default userSlice.reducer;