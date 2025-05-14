import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"

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
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/v1.0/employee`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return response.data;
    } catch(error){
        console.log(error);
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