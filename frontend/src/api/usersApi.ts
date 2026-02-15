import { baseApi } from "./baseApi";
import { apiTags } from "./tags";

export interface User {
  id: string;
  name: string;
  surName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetailed {
  id: string;
  role: { id: string; name: string };
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
    birthDate: string;
    gender: "M" | "F";
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
    id?: string;
    brand: string;
    model: string;
    information: string;
    year: string;
    vin: string;
    licensePlate: string;
  }[];
  orders?: {
    id: string;
    status: string;
    createdAt: string;
    updateAt: string;
    completedAt: string;
  }[];
}

export interface CreateUserDto {
  login: string;
  name: string;
  surName: string;
  email: string;
  phone: string;
  password: string;
  passportIdentityNumber: string;
  passportBirthDate: Date;
  passportGender: "M" | "F";
}

export interface UpdateUserDto {
  name?: string;
  surName?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleId?: string;
}

export interface UpdateCarDto {
  id?: string;
  brand?: string;
  model?: string;
  information?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
}

export interface UpdateProfileDto {
  name?: string;
  surName?: string;
  email?: string;
  phone?: string;
  cars?: UpdateCarDto[];
}

export interface RoleOption {
  id: string;
  name: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      User[],
      { search?: string; sortBy?: string; sortOrder?: "asc" | "desc" }
    >({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: [apiTags.USERS],
    }),
    getRoles: builder.query<RoleOption[], void>({
      query: () => "/users/roles",
      providesTags: [apiTags.USERS],
    }),
    getUserById: builder.query<UserDetailed, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: apiTags.USER, id }],
    }),
    getRawUsers: builder.query<User[], void>({
      query: () => "/users/rawData/users",
      providesTags: [apiTags.USERS],
    }),
    createUser: builder.mutation<User, CreateUserDto>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [apiTags.USERS],
    }),
    updateUser: builder.mutation<
      UserDetailed,
      { id: string; data: UpdateUserDto }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: apiTags.USER, id },
        apiTags.USERS,
      ],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [apiTags.USERS],
    }),
    getMyProfile: builder.query<UserDetailed, void>({
      query: () => "/users/profile/me",
      providesTags: [apiTags.USER],
    }),
    updateMyProfile: builder.mutation<UserDetailed, UpdateProfileDto>({
      query: (data) => ({
        url: "/users/profile/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [apiTags.USER, apiTags.USERS],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useGetRawUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} = usersApi;
