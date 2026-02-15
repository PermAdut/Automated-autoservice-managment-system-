export interface User {
  id: string;
  login: string;
  roleId: string;
  name: string;
  surName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Review {
  id: string;
  description: string;
  rate: number;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  information: string;
  year: string;
  vin: string;
  licensePlate: string;
}

export interface Order {
  id: string;
  status: string;
  createdAt: string;
  updateAt: string;
  completedAt: string;
}

export interface Passport {
  identityNumber: string;
  birthDate: string;
  gender: 'M' | 'F';
}

export interface UserDetailed extends User {
  role: Role;
  passport: Passport;
  subscriptions?: Subscription[];
  reviews?: Review[];
  cars?: Car[];
  orders?: Order[];
}
