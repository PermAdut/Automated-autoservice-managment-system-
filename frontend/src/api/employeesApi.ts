import { baseApi } from './baseApi';
import { apiTags } from './tags';

export interface Employee {
  id: number;
  positionId: number;
  hireDate: string;
  salary: string;
  position?: {
    id: number;
    name: string;
    description: string;
  };
  schedule?: {
    id: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  };
  orders?: {
    id: number;
    status: string;
  };
}

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], { search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }>({
      query: (params) => ({
        url: '/employee',
        params,
      }),
      providesTags: [apiTags.EMPLOYEES],
    }),
    getEmployeeById: builder.query<Employee, number>({
      query: (id) => `/employee/${id}`,
      providesTags: (result, error, id) => [{ type: apiTags.EMPLOYEE, id }],
    }),
    createEmployee: builder.mutation<Employee, Partial<Employee>>({
      query: (body) => ({
        url: '/employee',
        method: 'POST',
        body,
      }),
      invalidatesTags: [apiTags.EMPLOYEES],
    }),
    updateEmployee: builder.mutation<Employee, { id: number; data: Partial<Employee> }>({
      query: ({ id, data }) => ({
        url: `/employee/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: apiTags.EMPLOYEE, id },
        apiTags.EMPLOYEES,
      ],
    }),
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({
        url: `/employee/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [apiTags.EMPLOYEES],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeesApi;

