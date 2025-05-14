import { Expose } from 'class-transformer';

export class SparePartStockResponseDto {
  @Expose({ name: 'store_id' })
  id: number;

  @Expose()
  location: string;

  @Expose()
  quantity: number;

  @Expose()
  sparePart: {
    id: number;
    name: string;
    partNumber: string;
    price: number;
    category: {
      id: number;
      name: string;
      description: string;
    };
  };
}
