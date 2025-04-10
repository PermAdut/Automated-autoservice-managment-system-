import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Supplier {
    id: number;
    name: string;
    address: string;
    contact: string;
    positionsForBuying:{
        id:number;
        quantity:number;
        deliverDate:string;
        status:string;
        sparePart:{
            id:number;
            name:string;
            price:number;
            quantity:number;
            description:string;
            category:{
                id:number;
                name:string;
                description:string;
            }
        }[],
    }[],
}

interface SupplierState{
    suppliers:Supplier[];
    loading:boolean;
    error:string;
}

export const initialState:SupplierState={
    suppliers:[],
    loading:false,
    error:""
}

export const fetchSuppliers=createAsyncThunk("suppliers/fetchSuppliers",async(_,{rejectWithValue})=>{
    try{
        const mockSuppliers: Supplier[] = [
            {
                id: 1,
                name: "AutoParts Plus",
                address: "123 Main Street, City",
                contact: "+1234567890",
                positionsForBuying: [
                    {
                        id: 1,
                        quantity: 10,
                        deliverDate: "2024-02-01",
                        status: "pending",
                        sparePart: [{
                            id: 1,
                            name: "Brake Pads",
                            price: 2500,
                            quantity: 50,
                            description: "High quality brake pads",
                            category: {
                                id: 1,
                                name: "Braking System",
                                description: "Parts for vehicle braking system"
                            }
                        }]
                    }
                ]
            },
            {
                id: 2,
                name: "Parts & Service Co",
                address: "456 Oak Road, Town",
                contact: "+0987654321",
                positionsForBuying: [
                    {
                        id: 2,
                        quantity: 5,
                        deliverDate: "2024-02-15",
                        status: "delivered",
                        sparePart: [{
                            id: 2,
                            name: "Oil Filter",
                            price: 500,
                            quantity: 100,
                            description: "Engine oil filter",
                            category: {
                                id: 2,
                                name: "Engine Parts",
                                description: "Engine maintenance parts"
                            }
                        }]
                    }
                ]
            }
        ];
        return mockSuppliers;
    }catch{
        return rejectWithValue("Failed to fetch suppliers");
    }
})

export const suppliersSlice=createSlice({
    name:"suppliers",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchSuppliers.pending,(state)=>{
            state.loading=true;
            state.error="";
        })
        .addCase(fetchSuppliers.fulfilled,(state,action)=>{
            state.loading=false;
            state.suppliers=action.payload;
        })
        .addCase(fetchSuppliers.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload as string;
        })
    }
})

export default suppliersSlice.reducer;