import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ServiceResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Замена масла' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'Полная замена масла и масляного фильтра' })
  @Expose()
  description: string;

  @ApiProperty({ example: 1000 })
  @Expose()
  price: number;
}
