import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { serverConfig } from "../configs/serverConfig";

export interface TenantBranding {
  companyName: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  workingHours: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  website: string | null;
  mapCoordinates: string | null;
  currency: string;
  language: string;
  features: {
    onlineBooking: boolean;
    vinDecoder: boolean;
    loyaltyProgram: boolean;
    partnerNetwork: boolean;
    multiBranch: boolean;
    corporateClients: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
  };
}

export interface TenantSettings extends TenantBranding {
  id: string;
  isSetupComplete: boolean;
  setupCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Separate API for tenant — uses root URL (not /api/v1.0 prefix)
// since tenant endpoints don't require auth for public branding
export const tenantApi = createApi({
  reducerPath: "tenantApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${serverConfig.url}` }),
  tagTypes: ["TenantBranding", "TenantSettings", "TenantPages"],
  endpoints: (builder) => ({
    getPublicBranding: builder.query<TenantBranding, void>({
      query: () => "/tenant/branding",
      providesTags: ["TenantBranding"],
    }),
    getTenantSettings: builder.query<TenantSettings, void>({
      query: () => ({
        url: "/tenant/settings",
        headers: {
          authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }),
      providesTags: ["TenantSettings"],
    }),
    updateTenantSettings: builder.mutation<TenantSettings, Partial<TenantSettings>>({
      query: (body) => ({
        url: "/tenant/settings",
        method: "PUT",
        body,
        headers: {
          authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }),
      invalidatesTags: ["TenantBranding", "TenantSettings"],
    }),
    completeSetup: builder.mutation<TenantSettings, void>({
      query: () => ({
        url: "/tenant/settings/complete-setup",
        method: "POST",
        headers: {
          authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }),
      invalidatesTags: ["TenantSettings"],
    }),
    getTenantPages: builder.query<any[], void>({
      query: () => "/tenant/pages",
      providesTags: ["TenantPages"],
    }),
    getTenantPage: builder.query<any, string>({
      query: (slug) => `/tenant/pages/${slug}`,
    }),
  }),
});

export const {
  useGetPublicBrandingQuery,
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
  useCompleteSetupMutation,
  useGetTenantPagesQuery,
  useGetTenantPageQuery,
} = tenantApi;
