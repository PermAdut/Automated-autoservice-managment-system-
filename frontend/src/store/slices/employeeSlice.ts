import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
// import axios from "axios"

interface Employee{
    id:number,
    position:{
        id:number,
        name:string,
        description?:string
    },
    orders:{
        id:number,
        status:string,
    },
    schedule:{
        startTime:string,
        endTime:string,
        isAvailable:boolean,
    },
    hireDate:string,
    salary:number,
}

interface EmployeeState{
    employees:Employee[],
    isLoading:boolean,
    error:string | null,
}

export const fetchEmployees = createAsyncThunk('employees/fetch', async (_, {rejectWithValue}) => {
    try{
        const mockEmployees: Employee[] = [
            {
              id: 1,
              position: {
                id: 1,
                name: 'Механик',
                description: 'Ремонт и обслуживание автомобилей',
              },
              orders: {
                id: 101,
                status: 'in_progress',
              },
              schedule: {
                startTime: '2025-04-07T09:00:00Z',
                endTime: '2025-04-07T17:00:00Z',
                isAvailable: true,
              },
              hireDate: '2023-01-15T00:00:00Z',
              salary: 60000,
            },
            {
              id: 2,
              position: {
                id: 2,
                name: 'Менеджер',
                description: 'Управление заказами и клиентами',
              },
              orders: {
                id: 102,
                status: 'completed',
              },
              schedule: {
                startTime: '2025-04-07T08:00:00Z',
                endTime: '2025-04-07T16:00:00Z',
                isAvailable: false,
              },
              hireDate: '2022-06-10T00:00:00Z',
              salary: 75000,
            },
            {
              id: 4,
              position: {
                id: 3,
                name: 'Администратор',
              },
              orders: {
                id: 103,
                status: 'pending',
              },
              schedule: {
                startTime: '2025-04-07T10:00:00Z',
                endTime: '2025-04-07T18:00:00Z',
                isAvailable: true,
              },
              hireDate: '2024-03-01T00:00:00Z',
              salary: 50000,
            },
            {
              id: 5,
              position: {
                id: 1,
                name: 'Механик',
                description: 'Ремонт и обслуживание автомобилей',
              },
              orders: {
                id: 101,
                status: 'in_progress',
              },
              schedule: {
                startTime: '2025-04-07T09:00:00Z',
                endTime: '2025-04-07T17:00:00Z',
                isAvailable: true,
              },
              hireDate: '2023-01-15T00:00:00Z',
              salary: 60000,
            },
            {
              id: 6,
              position: {
                id: 2,
                name: 'Менеджер',
                description: 'Управление заказами и клиентами',
              },
              orders: {
                id: 102,
                status: 'completed',
              },
              schedule: {
                startTime: '2025-04-07T08:00:00Z',
                endTime: '2025-04-07T16:00:00Z',
                isAvailable: false,
              },
              hireDate: '2022-06-10T00:00:00Z',
              salary: 75000,
            },
            {
              id: 7,
              position: {
                id: 3,
                name: 'Администратор',
              },
              orders: {
                id: 103,
                status: 'pending',
              },
              schedule: {
                startTime: '2025-04-07T10:00:00Z',
                endTime: '2025-04-07T18:00:00Z',
                isAvailable: true,
              },
              hireDate: '2024-03-01T00:00:00Z',
              salary: 50000,
            },
            {
              id: 8,
              position: {
                id: 1,
                name: 'Механик',
                description: 'Ремонт и обслуживание автомобилей',
              },
              orders: {
                id: 101,
                status: 'in_progress',
              },
              schedule: {
                startTime: '2025-04-07T09:00:00Z',
                endTime: '2025-04-07T17:00:00Z',
                isAvailable: true,
              },
              hireDate: '2023-01-15T00:00:00Z',
              salary: 60000,
            },
            {
              id: 9,
              position: {
                id: 2,
                name: 'Менеджер',
                description: 'Управление заказами и клиентами',
              },
              orders: {
                id: 102,
                status: 'completed',
              },
              schedule: {
                startTime: '2025-04-07T08:00:00Z',
                endTime: '2025-04-07T16:00:00Z',
                isAvailable: false,
              },
              hireDate: '2022-06-10T00:00:00Z',
              salary: 75000,
            },
            {
              id: 3,
              position: {
                id: 3,
                name: 'Администратор',
              },
              orders: {
                id: 103,
                status: 'pending',
              },
              schedule: {
                startTime: '2025-04-07T10:00:00Z',
                endTime: '2025-04-07T18:00:00Z',
                isAvailable: true,
              },
              hireDate: '2024-03-01T00:00:00Z',
              salary: 50000,
            },
          ];
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return mockEmployees;
    } catch{
        return rejectWithValue('Failed to fetch employees');
    }
})

const employeeSlice = createSlice({
    name: 'employees',
    initialState: {
      employees: [],
      isLoading: false,
      error: null,
    } as EmployeeState,
    reducers: {},
    extraReducers: (builder) => {
        builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    }
})

export default employeeSlice.reducer;