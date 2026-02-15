import { Expose, Type } from 'class-transformer';

export class SupplierResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  contact: string;

  @Expose()
  @Type(() => Object)
  positionsForBuying: {
    id: string;
    quantity: number;
    deliverDate: string;
    status: string;
    sparePart?: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      description: string;
      category: {
        id: string;
        name: string;
        description: string;
      };
    }[];
  }[];
}
