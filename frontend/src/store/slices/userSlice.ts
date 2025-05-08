import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { serverConfig } from '../../configs/serverConfig';

interface User {
  id: number;
  name: string;
  surName: string;
}

export interface UserDetailed {
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
      const response = await axios.get(`${serverConfig.url}/api/v1.0/users/rawData/users`);
      return response.data;
    } catch {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const fetchUsersById = createAsyncThunk(
  'users/fetchUsersById',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${serverConfig.url}/api/v1.0/users/${userId}`);
      const userData = response.data;
      return userData;
    } catch {
      return rejectWithValue('Failed to fetch user by ID');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${serverConfig.url}/api/v1.0/users/${userId}`);
      return response.data;
    } catch {
      return rejectWithValue('Failed to delete user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (user: UserDetailed, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${serverConfig.url}/api/v1.0/users/${user.id}`, user);
      return response.data;
    } catch {
      return rejectWithValue('Failed to update user');
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