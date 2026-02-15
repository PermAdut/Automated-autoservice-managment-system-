export interface Spare {
  id: string;
  name: string;
  partNumber: string;
  price: number;
  categoryId: string;
  idStore: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Store {
  id: string;
  location: string;
}
