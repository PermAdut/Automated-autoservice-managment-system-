export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface PositionForBuying {
  id: string;
  quantity: number;
  deliverDate: string;
  status: string;
}

export interface SparePart {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}
