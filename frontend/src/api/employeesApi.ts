import { baseApi } from "./baseApi";
import { apiTags } from "./tags";

export interface Employee {
  id: number;
  name: string;
  surName: string;
  lastName?: string | null;
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

export interface PositionOption {
  id: number;
  name: string;
  description?: string;
}

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<
      Employee[],
      { search?: string; sortBy?: string; sortOrder?: "asc" | "desc" }
    >({
      query: (params) => ({
        url: "/employee",
        params,
      }),
      providesTags: [apiTags.EMPLOYEES],
    }),
    getEmployeeById: builder.query<Employee, number>({
      query: (id) => `/employee/${id}`,
      providesTags: (_result, _error, id) => [{ type: apiTags.EMPLOYEE, id }],
    }),
    getPositions: builder.query<PositionOption[], void>({
      query: () => "/employee/positions",
      providesTags: [apiTags.POSITIONS],
    }),
    createEmployee: builder.mutation<Employee, Partial<Employee>>({
      query: (body) => ({
        url: "/employee",
        method: "POST",
        body,
      }),
      invalidatesTags: [apiTags.EMPLOYEES, apiTags.POSITIONS],
    }),
    updateEmployee: builder.mutation<
      Employee,
      { id: number; data: Partial<Employee> }
    >({
      query: ({ id, data }) => ({
        url: `/employee/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: apiTags.EMPLOYEE, id },
        apiTags.EMPLOYEES,
        apiTags.POSITIONS,
      ],
    }),
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({
        url: `/employee/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [apiTags.EMPLOYEES, apiTags.POSITIONS],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useGetPositionsQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeesApi;
