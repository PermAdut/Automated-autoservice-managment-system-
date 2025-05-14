export interface Spare {
  id: number;
  name: string;
  partNumber: string;
  price: number;
  categoryId: number;
  idStore: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Store {
  id: number;
  location: string;
}
