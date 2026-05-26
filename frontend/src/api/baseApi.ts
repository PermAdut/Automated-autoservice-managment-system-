import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from "@reduxjs/toolkit/query";
import { serverConfig } from "../configs/serverConfig";
import {
  updateAccessToken,
  logout,
  setCredentials,
} from "../store/slices/authSlice";
import type { AppDispatch } from "../store";
import { apiTags } from "./tags";
import { enqueue } from "../offline/syncQueue";

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
  const isMutation =
    typeof args !== "string" &&
    ["POST", "PUT", "PATCH", "DELETE"].includes((args.method ?? "GET").toUpperCase());

  if (!navigator.onLine && isMutation) {
    const req = typeof args === "string" ? { url: args, method: "GET" as const } : args;
    const url = req.url.startsWith("http")
      ? req.url
      : `${serverConfig.url}/api/v1.0${req.url.startsWith("/") ? req.url : `/${req.url}`}`;
    await enqueue({
      method: (req.method ?? "POST").toUpperCase() as "POST" | "PATCH" | "PUT" | "DELETE",
      url,
      body: req.body,
      maxRetries: 5,
    });
    return {
      data: { queued: true, offline: true },
    } as QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>;
  }

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

interface AuthUser {
  id: string;
  email: string;
  name: string;
  surName: string;
  roleId: string;
  roleName: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: Object.values(apiTags) as readonly string[],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<
      AuthResponse,
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
          const data = result.data as AuthResponse;
          (_api.dispatch as AppDispatch)(
            setCredentials({
              user: data.user,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            })
          );
        }

        return result as QueryReturnValue<AuthResponse, FetchBaseQueryError, FetchBaseQueryMeta>;
      },
    }),
    register: builder.mutation<
      AuthResponse,
      {
        login: string;
        email: string;
        password: string;
        name: string;
        surName: string;
        phone?: string;
        passportIdentityNumber: string;
        passportBirthDate: string;
        passportGender: "M" | "F";
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
          const response = result.data as AuthResponse;
          (_api.dispatch as AppDispatch)(
            setCredentials({
              user: response.user,
              accessToken: response.access_token,
              refreshToken: response.refresh_token,
            })
          );
        }

        return result as QueryReturnValue<AuthResponse, FetchBaseQueryError, FetchBaseQueryMeta>;
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
        )) as QueryReturnValue<{ access_token: string }, FetchBaseQueryError, FetchBaseQueryMeta>;
      },
    }),
    logout: builder.mutation<{ message: string }, { refresh_token: string }>({
      queryFn: async (data, _api, _extraOptions) => {
        const accessToken = localStorage.getItem("access_token");
        const result = await authBaseQuery(
          {
            url: "/auth/logout",
            method: "POST",
            body: { ...data, access_token: accessToken ?? undefined },
          },
          _api,
          _extraOptions
        );
        (_api.dispatch as AppDispatch)(logout());
        return result as QueryReturnValue<{ message: string }, FetchBaseQueryError, FetchBaseQueryMeta>;
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
        )) as QueryReturnValue<void, FetchBaseQueryError, FetchBaseQueryMeta>;
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
