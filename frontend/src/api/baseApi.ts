import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { serverConfig } from "../configs/serverConfig";
import { updateAccessToken, logout } from "../store/slices/authSlice";
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
  endpoints: () => ({}),
});
