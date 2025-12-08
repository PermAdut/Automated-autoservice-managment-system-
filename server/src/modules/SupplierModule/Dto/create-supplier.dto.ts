import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  contact?: string;

  @IsString()
  @IsNotEmpty()
  address?: string;
}
