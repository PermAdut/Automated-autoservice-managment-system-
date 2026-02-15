import { Expose } from 'class-transformer';

export class SparePartStockResponseDto {
  @Expose({ name: 'store_id' })
  id: string;

  @Expose()
  location: string;

  @Expose()
  quantity: number;

  @Expose()
  sparePart: {
    id: string;
    name: string;
    partNumber: string;
    price: number;
    category: {
      id: string;
      name: string;
      description: string;
    };
  };
}
