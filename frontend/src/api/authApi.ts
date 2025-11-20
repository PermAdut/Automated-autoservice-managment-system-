import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { serverConfig } from '../configs/serverConfig';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    surName: string;
    roleId: number;
    roleName: string;
  };
}

export interface RefreshResponse {
  access_token: string;
}

const authBaseQuery = fetchBaseQuery({
  baseUrl: `${serverConfig.url}`,
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: authBaseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginDto>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    refreshToken: builder.mutation<RefreshResponse, RefreshTokenDto>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<{ message: string }, RefreshTokenDto>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
    }),
    googleAuth: builder.query<void, void>({
      query: () => '/auth/google',
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGoogleAuthQuery,
} = authApi;

