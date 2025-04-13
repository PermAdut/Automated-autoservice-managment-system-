import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Car, Order, Passport, Review, Subscription } from '../schemas/User';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'User id',
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'User name',
    type: String,
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'User surName',
    type: String,
  })
  surName: string;

  @Expose()
  @ApiProperty({
    description: 'User email',
    type: String,
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'User phone',
    type: String,
  })
  phone: string;

  @Expose()
  @ApiProperty({
    description: 'User role',
    type: String,
  })
  role: string;

  @Expose()
  @ApiProperty({
    description: 'User createdAt',
    type: String,
  })
  createdAt: string;

  @Expose()
  @ApiProperty({
    description: 'User updatedAt',
    type: String,
  })
  updatedAt: string;

  @Expose()
  @ApiProperty({
    description: 'User passport',
  })
  passport: Passport;

  @Expose()
  @ApiProperty({
    description: 'User orders',
  })
  orders?: Order[];

  @Expose()
  @ApiProperty({
    description: 'User cars',
  })
  cars?: Car[];

  @Expose()
  @ApiProperty({
    description: 'User reviews',
  })
  reviews?: Review[];

  @Expose()
  @ApiProperty({
    description: 'User subscriptions',
  })
  subscriptions?: Subscription[];
}
