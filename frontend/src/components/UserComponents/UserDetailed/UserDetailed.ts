export interface UserDetailed{
    id:number,
    role:UserRole,
    login:string,
    name:string,
    surName:string,
    email:string,
    phone:string,
    passwordHash?:string,
    createdAt:string,
    updatedAt:string
}

export interface UserRole{
    id:number,
    name:string,
}

export interface UserPassport{
    identityNumber:string,
    nationality:string,
    birthDate:string,
    gender:GenderEnum,
    expiriationDate:string
}

export interface UserSubscriptions{
    subscriptionDescription:string,
    subscriptionName:string,
    dateStart:string,
    dateEnd:string
}

export interface UserReviews{
    description:string,
    rate:number,
    createdAt:string,
    updatedAt:string,
    deletedAt:string,
}

export interface UserCars{
    name:string,
    information:string,
    year:string,
    vin:string,
    licensePlate:string,
}

export interface UserOrders{
    id:number,
    status:string,
    createdAt:string,
    updateAt:string,
    completedAt:string,
}

enum GenderEnum{
    Male = 'M',
    Female = 'F',
}