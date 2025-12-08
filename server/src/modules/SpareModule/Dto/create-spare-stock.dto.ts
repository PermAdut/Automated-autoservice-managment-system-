import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateSpareStockDto {
  @IsNumber()
  @IsNotEmpty()
  sparePartId: number;

  @IsNumber()
  @IsNotEmpty()
  storeId: number;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class UpdateSpareStockDto extends PartialType(CreateSpareStockDto) {}
