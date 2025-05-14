import { UserDetailed } from "../../../store/slices/userSlice";

export interface UserItemProps{
    id:number,  
    name:string,
    secondName:string,
    orders?:Order[],
    onDelete: (id: number) => void,
    onUpdate: (userData: UserDetailed) => void
}

export interface Order{
    title:string,
    description?:string,
    dateStart:string,
    dateEnd:string
}