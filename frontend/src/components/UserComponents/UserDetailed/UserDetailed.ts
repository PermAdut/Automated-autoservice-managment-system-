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
    updatedAt:string,
    passport:UserPassport,
    subscriptions:UserSubscriptions,
    reviews:UserReviews,
    cars:UserCars,
    orders:UserOrders,
}

interface UserRole{
    id:number,
    name:string,
}

interface UserPassport{
    identityNumber:string,
    nationality:string,
    birthDate:string,
    gender:GenderEnum,
    expiriationDate:string
}

interface UserSubscriptions{
    subscriptionDescription:string,
    subscriptionName:string,
    dateStart:string,
    dateEnd:string
}

interface UserReviews{
    description:string,
    rate:number,
    createdAt:string,
    updatedAt:string,
    deletedAt:string,
}

interface UserCars{
    name:string,
    information:string,
    year:string,
    vin:string,
    licensePlate:string,
}

interface UserOrders{
    id:string,
    status:string,
    createdAt:string,
    updateAt:string,
    completedAt:string,
}

enum GenderEnum{
    Male = 'M',
    Female = 'F',
}
