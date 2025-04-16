import { Exclude, Expose, Type } from 'class-transformer';
import { Category, PositionForBuying, SparePart } from '../schemas/Supplier';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
@Exclude()
export class SupplierResponseDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  contact: string;

  @Expose()
  @IsString()
  address: string;

  @Expose()
  @IsOptional()
  @Type(() => PositionForBuyingResponseDto)
  positionForBuying?: PositionForBuying[];
}

export class PositionForBuyingResponseDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsInt()
  quantity: number;

  @Expose()
  @IsDate()
  deliverDate: string;

  @Expose()
  @IsString()
  status: string;

  @Expose()
  @Type(() => SparePartResponseDto)
  sparePart: SparePart[];
}

export class SparePartResponseDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsInt()
  price: number;

  @Expose()
  @IsInt()
  quantity: number;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @Type(() => CategoryResponseDto)
  category: Category;
}

export class CategoryResponseDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;
}
