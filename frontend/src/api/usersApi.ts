import { baseApi } from './baseApi';
import { apiTags } from './tags';

export interface User {
  id: number;
  name: string;
  surName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
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

export interface CreateUserDto {
  login: string;
  name: string;
  surName: string;
  email: string;
  phone: string;
  password: string;
  passportIdentityNumber: string;
  passportNationality: string;
  passportBirthDate: Date;
  passportGender: 'M' | 'F';
  passportExpirationDate: Date;
}

export interface UpdateUserDto {
  name?: string;
  surName?: string;
  email?: string;
  phone?: string;
  password: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], { search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: [apiTags.USERS],
    }),
    getUserById: builder.query<UserDetailed, number>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: apiTags.USER, id }],
    }),
    getRawUsers: builder.query<User[], void>({
      query: () => '/users/rawData/users',
      providesTags: [apiTags.USERS],
    }),
    createUser: builder.mutation<User, CreateUserDto>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [apiTags.USERS],
    }),
    updateUser: builder.mutation<UserDetailed, { id: number; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: apiTags.USER, id },
        apiTags.USERS,
      ],
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [apiTags.USERS],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetRawUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;

