import { Expose } from 'class-transformer';

export class OrderResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  carId: number | null;

  @Expose()
  employeeId: number | null;

  @Expose()
  status: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string | null;

  @Expose()
  completedAt: string | null;

  @Expose()
  services: {
    id: number;
    name: string;
    description: string;
    price: number;
  }[];

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
  }[];
}
