/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { serverConfig } from "../configs/serverConfig";
import {
  updateAccessToken,
  logout,
  setCredentials,
} from "../store/slices/authSlice";
import type { AppDispatch } from "../store";
import { apiTags } from "./tags";

const baseQuery = fetchBaseQuery({
  baseUrl: `${serverConfig.url}/api/v1.0`,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const authBaseQuery = fetchBaseQuery({
  baseUrl: `${serverConfig.url}`,
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        const refreshResult = await fetch(`${serverConfig.url}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResult.ok) {
          const data = await refreshResult.json();
          (api.dispatch as AppDispatch)(updateAccessToken(data.access_token));

          // Retry the original query
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed, logout
          (api.dispatch as AppDispatch)(logout());
        }
      } catch {
        (api.dispatch as AppDispatch)(logout());
      }
    } else {
      (api.dispatch as AppDispatch)(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: Object.values(apiTags) as readonly string[],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<
      {
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
      },
      { email: string; password: string }
    >({
      queryFn: async (credentials, _api, _extraOptions) => {
        const result = await authBaseQuery(
          {
            url: "/auth/login",
            method: "POST",
            body: credentials,
          },
          _api,
          _extraOptions
        );

        if (result.data) {
          const data = result.data as {
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
          };
          (_api.dispatch as AppDispatch)(
            setCredentials({
              user: data.user,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            })
          );
        }

        return result as any;
      },
    }),
    register: builder.mutation<
      {
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
      },
      {
        login: string;
        email: string;
        password: string;
        name: string;
        surName: string;
        phone?: string;
        passportIdentityNumber: string;
        passportNationality: string;
        passportBirthDate: string;
        passportGender: "M" | "F";
        passportExpirationDate: string;
      }
    >({
      queryFn: async (data, _api, _extraOptions) => {
        const result = await authBaseQuery(
          {
            url: "/auth/register",
            method: "POST",
            body: data,
          },
          _api,
          _extraOptions
        );

        if (result.data) {
          const response = result.data as {
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
          };
          (_api.dispatch as AppDispatch)(
            setCredentials({
              user: response.user,
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
            })
          );
        }

        return result as any;
      },
    }),
    refreshToken: builder.mutation<
      { access_token: string },
      { refresh_token: string }
    >({
      queryFn: async (data, _api, _extraOptions) => {
        return (await authBaseQuery(
          {
            url: "/auth/refresh",
            method: "POST",
            body: data,
          },
          _api,
          _extraOptions
        )) as any;
      },
    }),
    logout: builder.mutation<{ message: string }, { refresh_token: string }>({
      queryFn: async (data, _api, _extraOptions) => {
        const result = await authBaseQuery(
          {
            url: "/auth/logout",
            method: "POST",
            body: data,
          },
          _api,
          _extraOptions
        );
        (_api.dispatch as AppDispatch)(logout());
        return result as any;
      },
    }),
    googleAuth: builder.query<void, void>({
      queryFn: async (_arg, _api, _extraOptions) => {
        return (await authBaseQuery(
          {
            url: "/auth/google",
          },
          _api,
          _extraOptions
        )) as any;
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGoogleAuthQuery,
} = baseApi;
