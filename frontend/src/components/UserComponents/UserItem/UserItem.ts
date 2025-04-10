export interface UserItemProps{
    id:number,
    name:string,
    secondName:string,
    orders?:Order[]
}

export interface Order{
    title:string,
    description?:string,
    dateStart:string,
    dateEnd:string
}