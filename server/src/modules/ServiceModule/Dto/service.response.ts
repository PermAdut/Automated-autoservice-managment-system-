import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ServiceResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

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
