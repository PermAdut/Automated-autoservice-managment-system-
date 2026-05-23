import { baseApi } from "./baseApi";
import { apiTags } from "./tags";

export interface Employee {
  id: string;
  name: string;
  surName: string;
  lastName?: string | null;
  positionId: string;
  hireDate: string;
  salary: string;
  position?: {
    id: string;
    name: string;
    description: string;
  };
  schedule?: {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  };
  orders?: {
    id: string;
    status: string;
  };
  contact?: {
    email?: string | null;
    phone?: string | null;
  };
  branch?: {
    id: string;
    name: string;
    isPrimary: boolean;
  };
  qualifications?: EmployeeQualification[];
}

export interface WorkType {
  id: string;
  name: string;
  description?: string;
}

export interface EmployeeQualification {
  id: string;
  workTypeId: string;
  workTypeName: string;
  level: number;
}

export interface QualificationInput {
  workTypeId: string;
  level: number;
}

export interface PositionOption {
  id: string;
  name: string;
  description?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  employeeId?: string;
  subscriptionName: string;
  dateStart: string;
  dateEnd: string;
}

export interface Review {
  id: string;
  userId: string;
  employeeId?: string;
  description?: string;
  rate: number;
  createdAt: string;
  userName?: string;
  userSurName?: string;
}

export interface CreateReviewDto {
  employeeId: string;
  description?: string;
  rate: number;
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
    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `/employee/${id}`,
      providesTags: (_result, _error, id) => [{ type: apiTags.EMPLOYEE, id }],
    }),
    getPositions: builder.query<PositionOption[], void>({
      query: () => "/employee/positions",
      providesTags: [apiTags.POSITIONS],
    }),
    getWorkTypes: builder.query<WorkType[], void>({
      query: () => "/employee/work-types",
      providesTags: [apiTags.POSITIONS],
    }),
    getEmployeeQualifications: builder.query<EmployeeQualification[], string>({
      query: (employeeId) => `/employee/${employeeId}/qualifications`,
      providesTags: (_result, _error, employeeId) => [
        { type: apiTags.EMPLOYEE, id: `qualifications-${employeeId}` },
      ],
    }),
    setEmployeeQualifications: builder.mutation<
      EmployeeQualification[],
      { employeeId: string; qualifications: QualificationInput[] }
    >({
      query: ({ employeeId, qualifications }) => ({
        url: `/employee/${employeeId}/qualifications`,
        method: "PUT",
        body: { qualifications },
      }),
      invalidatesTags: (_result, _error, { employeeId }) => [
        { type: apiTags.EMPLOYEE, id: employeeId },
        { type: apiTags.EMPLOYEE, id: `qualifications-${employeeId}` },
        apiTags.EMPLOYEES,
      ],
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
      { id: string; data: Partial<Employee> }
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
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/employee/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [apiTags.EMPLOYEES, apiTags.POSITIONS],
    }),
    subscribeToEmployee: builder.mutation<Subscription, string>({
      query: (employeeId) => ({
        url: `/employee/${employeeId}/subscribe`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, employeeId) => [
        { type: apiTags.EMPLOYEE, id: `subscription-${employeeId}` },
      ],
    }),
    unsubscribeFromEmployee: builder.mutation<{ message: string }, string>({
      query: (employeeId) => ({
        url: `/employee/${employeeId}/subscribe`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, employeeId) => [
        { type: apiTags.EMPLOYEE, id: `subscription-${employeeId}` },
      ],
    }),
    getUserSubscription: builder.query<
      { subscribed: boolean; subscription?: Subscription },
      string
    >({
      query: (employeeId) => `/employee/${employeeId}/subscription`,
      providesTags: (_result, _error, employeeId) => [
        { type: apiTags.EMPLOYEE, id: `subscription-${employeeId}` },
      ],
    }),
    createReview: builder.mutation<Review, CreateReviewDto>({
      query: (body) => ({
        url: `/employee/${body.employeeId}/reviews`,
        method: "POST",
        body: { description: body.description, rate: body.rate },
      }),
      invalidatesTags: (_result, _error, { employeeId }) => [
        { type: apiTags.EMPLOYEE, id: employeeId },
      ],
    }),
    getEmployeeReviews: builder.query<Review[], string>({
      query: (employeeId) => `/employee/${employeeId}/reviews`,
      providesTags: (_result, _error, employeeId) => [
        { type: apiTags.EMPLOYEE, id: employeeId },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useGetPositionsQuery,
  useGetWorkTypesQuery,
  useGetEmployeeQualificationsQuery,
  useSetEmployeeQualificationsMutation,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useSubscribeToEmployeeMutation,
  useUnsubscribeFromEmployeeMutation,
  useGetUserSubscriptionQuery,
  useCreateReviewMutation,
  useGetEmployeeReviewsQuery,
} = employeesApi;
