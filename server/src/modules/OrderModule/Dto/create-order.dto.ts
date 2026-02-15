import { PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderServiceItemDto {
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class OrderSparePartItemDto {
  @IsUUID()
  @IsNotEmpty()
  sparePartId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsNotEmpty()
  carId: string;

  @IsUUID()
  @IsOptional()
  employeeId?: string;

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
