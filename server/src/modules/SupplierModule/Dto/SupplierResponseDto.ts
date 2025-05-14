import { Expose, Type } from 'class-transformer';

export class SupplierResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  contact: string;

  @Expose()
  @Type(() => Object)
  positionsForBuying: {
    id: number;
    quantity: number;
    deliverDate: string;
    status: string;
    sparePart: {
      id: number;
      name: string;
      price: number;
      quantity: number;
      description: string;
      category: {
        id: number;
        name: string;
        description: string;
      };
    }[];
  }[];
}
