export interface User {
  id: number;
  login: string;
  roleId: number;
  name: string;
  surName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Subscription {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface Review {
  id: number;
  description: string;
  rate: number;
}

export interface Car {
  id: number;
  name: string;
  information: string;
  year: string;
  vin: string;
  licensePlate: string;
}

export interface Order {
  id: number;
  status: string;
  createdAt: string;
  updateAt: string;
  completedAt: string;
}

export interface Passport {
  identityNumber: string;
  nationality: string;
  birthDate: string;
  gender: 'M' | 'F';
  expirationDate: string;
}

export interface UserDetailed extends User {
  role: Role;
  passport: Passport;
  subscriptions?: Subscription[];
  reviews?: Review[];
  cars?: Car[];
  orders?: Order[];
}
