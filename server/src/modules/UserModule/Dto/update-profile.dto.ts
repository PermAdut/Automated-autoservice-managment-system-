import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCarDto {
  @ApiProperty({ description: 'Car ID (for updates)', required: false })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Car brand', required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ description: 'Car model', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ description: 'Car information', required: false })
  @IsString()
  @IsOptional()
  information?: string;

  @ApiProperty({ description: 'Car year', required: false })
  @IsOptional()
  year?: number;

  @ApiProperty({ description: 'Car VIN', required: false })
  @IsString()
  @IsOptional()
  vin?: string;

  @ApiProperty({ description: 'Car license plate', required: false })
  @IsString()
  @IsOptional()
  licensePlate?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ description: 'User name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'User surName', required: false })
  @IsString()
  @IsOptional()
  surName?: string;

  @ApiProperty({ description: 'User email', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User phone', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'User cars', type: [UpdateCarDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCarDto)
  @IsOptional()
  cars?: UpdateCarDto[];
}
