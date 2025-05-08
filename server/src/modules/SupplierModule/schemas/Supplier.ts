export interface Supplier {
  id: number;
  name: string;
  contact: string;
  address: string;
}

export interface PositionForBuying {
  id: number;
  quantity: number;
  deliverDate: string;
  status: string;
}

export interface SparePart {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}
