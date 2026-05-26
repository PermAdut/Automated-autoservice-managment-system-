import { Expose, Type } from 'class-transformer';
import { PositionForBuyingResponseDto } from './position-for-buying-response.dto';

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
  @Type(() => PositionForBuyingResponseDto)
  positionsForBuying: PositionForBuyingResponseDto[];
}
