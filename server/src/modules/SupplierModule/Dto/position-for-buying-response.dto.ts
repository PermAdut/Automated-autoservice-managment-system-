import { Expose } from 'class-transformer';

export class PositionForBuyingResponseDto {
  @Expose()
  id: string;

  @Expose()
  quantity: number;

  @Expose()
  deliverDate: string;

  @Expose()
  status: string;

  @Expose()
  sparePartName?: string;

  @Expose()
  sparePartNumber?: string;
}
