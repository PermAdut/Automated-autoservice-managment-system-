import { Expose } from 'class-transformer';

export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  carId: string | null;

  @Expose()
  employeeId: string | null;

  @Expose()
  status: string | null;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string | null;

  @Expose()
  completedAt: string | null;

  @Expose()
  services: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    quantity: number;
  }[];

  @Expose()
  sparePart: {
    id: string;
    name: string;
    partNumber: string;
    price: number;
    quantity: number;
    category: {
      id: string;
      name: string;
      description: string | null;
    };
  }[];
}
