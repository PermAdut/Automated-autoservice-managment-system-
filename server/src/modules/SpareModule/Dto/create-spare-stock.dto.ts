import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateSpareStockDto {
  @IsUUID()
  @IsNotEmpty()
  sparePartId: string;

  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class UpdateSpareStockDto extends PartialType(CreateSpareStockDto) {}
