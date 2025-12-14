import { PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderServiceItemDto {
  @IsNumber()
  @IsNotEmpty()
  serviceId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class OrderSparePartItemDto {
  @IsNumber()
  @IsNotEmpty()
  sparePartId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsNotEmpty()
  carId: number;

  @IsNumber()
  @IsNotEmpty()
  employeeId: number;

  @IsDateString()
  @IsOptional()
  createdAt?: string;

  @IsDateString()
  @IsOptional()
  updatedAt?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderServiceItemDto)
  @IsOptional()
  services?: OrderServiceItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderSparePartItemDto)
  @IsOptional()
  spareParts?: OrderSparePartItemDto[];
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsString()
  @IsOptional()
  status?: string | null;
}
